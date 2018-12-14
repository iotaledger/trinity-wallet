import head from 'lodash/head';
import map from 'lodash/map';
import filter from 'lodash/filter';
import keys from 'lodash/keys';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import transform from 'lodash/transform';
import size from 'lodash/size';
import split from 'lodash/split';
import sampleSize from 'lodash/sampleSize';
import union from 'lodash/union';
import uniq from 'lodash/uniq';
import { isNodeSynced, getIotaInstance } from './extendedApi';
import {
    QUORUM_THRESHOLD,
    QUORUM_SIZE,
    QUORUM_NODES_SYNC_CHECKS_INTERVAL,
    DEFAULT_BALANCES_THRESHOLD,
} from '../../config';
import { EMPTY_HASH_TRYTES } from './utils';
import { findMostFrequent } from '../utils';
import Errors from '../errors';

/**
 * Resolves only if size of synced nodes is greater than or equal to quorum size
 *
 * @method rejectIfNotEnoughSyncedNodes
 *
 * @param {array} nodes
 * @param {number} quorumSize
 * @returns {Promise}
 */
const rejectIfNotEnoughSyncedNodes = (nodes, quorumSize = QUORUM_SIZE) => {
    if (size(nodes) < quorumSize) {
        return Promise.reject(new Error(Errors.NOT_ENOUGH_SYNCED_NODES));
    }

    return Promise.resolve();
};

/**
 * Resolves only if provided milestone is not equal to empty hash trytes (999...999)
 *
 * @method rejectIfEmptyHashTrytes
 *
 * @param {string} latestSolidSubtangleMilestone
 *
 * @returns {Promise<string>}
 */
const rejectIfEmptyHashTrytes = (latestSolidSubtangleMilestone) => {
    if (latestSolidSubtangleMilestone === EMPTY_HASH_TRYTES) {
        return Promise.reject(new Error(Errors.COULD_NOT_GET_QUORUM_FOR_LATEST_SOLID_SUBTANGLE_MILESTONE));
    }

    return Promise.resolve(latestSolidSubtangleMilestone);
};

/**
 *   Determines quorum result for supported methods.
 *
 *   @method determineQuorumResult
 *   @param {array} validResults
 *   @param {number} quorumSize
 *
 *   @returns {function(string, [number]): {boolean | string}}
 **/
const determineQuorumResult = (validResults, quorumSize = QUORUM_SIZE) => {
    const { frequency, mostFrequent } = findMostFrequent(validResults);

    return (method, threshold = QUORUM_THRESHOLD) => {
        // Include faulty result count while determining percentage
        const percentage = (frequency[mostFrequent] / quorumSize) * 100;

        if (percentage > threshold) {
            return mostFrequent;
        }

        return fallbackToSafeResult(method);
    };
};

/**
 *   Gets a safe result if quorum result falls below defined threshold
 *
 *   @method fallbackToSafeResult
 *   @param {string} method
 *
 *   @returns {boolean}
 **/
const fallbackToSafeResult = (method) => {
    const allowedMethodsMap = {
        wereAddressesSpentFrom: true,
        getInclusionStates: false,
        'getBalances:balances': '0',
        'getNodeInfo:latestSolidSubtangleMilestone': EMPTY_HASH_TRYTES,
    };

    if (!includes(keys(allowedMethodsMap), method)) {
        throw new Error(Errors.METHOD_NOT_SUPPORTED_FOR_QUORUM);
    }

    return allowedMethodsMap[method];
};

/**
 *   For a list of nodes, find healthy (synced) nodes with size equals to minimum quorum nodes size
 *
 *   @method findSyncedNodes
 *   @param {array} nodes
 *   @param {number} quorumSize
 *   @param {array} [syncedNodes = []]
 *   @param {array} [blacklistedNodes = []]
 *
 *   @returns {Promise}
 **/
const findSyncedNodes = (nodes, quorumSize, syncedNodes = [], blacklistedNodes = []) => {
    const sizeOfSyncedNodes = size(syncedNodes);

    // Get all nodes that are not synced & are not blacklisted (i.e., unsynced or unresponsive)
    const whitelistedNodes = filter(nodes, (node) => !includes(blacklistedNodes, node) && !includes(syncedNodes, node));

    if (
        isEmpty(whitelistedNodes) &&
        // If there are no nodes that are whitelisted
        // And we still need more nodes to complete the (minimum) quorum size, then raise an exception
        sizeOfSyncedNodes < quorumSize
    ) {
        return Promise.reject(new Error(Errors.NOT_ENOUGH_SYNCED_NODES));
    }

    const selectedNodes =
        // If we already have enough synced nodes, then just recheck if they are still synced
        sizeOfSyncedNodes === quorumSize
            ? syncedNodes
            : // Otherwise, randomly choose the remaining nodes
              sampleSize(whitelistedNodes, quorumSize - sizeOfSyncedNodes);

    return Promise.all(map(selectedNodes, (provider) => isNodeSynced(provider).catch(() => undefined))).then(
        (results) => {
            // Categorise synced/unsynced nodes
            const { activeNodes, inactiveNodes } = transform(
                selectedNodes,
                (acc, node, idx) => (results[idx] ? acc.activeNodes.push(node) : acc.inactiveNodes.push(node)),
                { activeNodes: [], inactiveNodes: [] },
            );

            // If all selected nodes are synced, then return these nodes
            if (size(activeNodes) === size(selectedNodes)) {
                return union(syncedNodes, activeNodes);
            }

            // Otherwise, restart this process
            return findSyncedNodes(
                nodes,
                quorumSize,
                // Add active nodes to synced nodes
                union(syncedNodes, activeNodes),
                // Add inactive nodes to blacklisted nodes
                [...blacklistedNodes, ...inactiveNodes],
            );
        },
    );
};

/**
 * From a set of responses of quorum nodes, prepare a quorum result.
 * wereAddressesSpentFrom: prepare a quorum result for spend status of each address
 * getBalances:balances: prepare a quorum result for balance of each address
 * getInclusionStates: prepare a quorum result for inclusion state of each tail transaction hash
 * getNodeInfo:latestSolidSubtangleMilestone: prepare a quorum result for latestSolidSubtangleMilestone of each quorum node
 *
 * @method prepareQuorumResults
 *
 * @param {string} method
 * @param  {...any} requestArgs
 *
 * @returns {function(array, number): {array | object | string}}
 */
const prepareQuorumResults = (method, ...requestArgs) => {
    const prepare = (results, payloadSize) => {
        const validResults = filter(results, (result) => !isUndefined(result));

        let idx = 0;
        const quorumResult = [];

        while (idx < payloadSize) {
            /* eslint-disable no-loop-func */
            quorumResult.push(determineQuorumResult(map(validResults, (result) => result[idx]))(method));
            /* eslint-enable no-loop-func */

            idx += 1;
        }

        return quorumResult;
    };

    switch (method) {
        case 'wereAddressesSpentFrom':
        case 'getInclusionStates':
            return prepare;
        case 'getBalances:balances':
            return (...args) => {
                // Unlike responses from other methods, getBalances returns an object (https://iota.readme.io/reference#getbalances)
                // However, we're only interested in preparing a quorum result for balances prop
                // So, tranform the response into an array of balances -> [['0', '2'], ['0', '2'], ..., ['0', '2']]
                const [results, ...restArgs] = args;

                const balances = prepare(
                    map(results, (result) => (isUndefined(result) ? undefined : result.balances)),
                    ...restArgs,
                );

                // Tips is the last argument for getBalances endpoint
                const [tips] = requestArgs.slice(-1);

                // Before returning the quorum results for getBalances,
                // transform the quorum result into the original result structure
                return { references: [tips], balances };
            };
        case 'getNodeInfo:latestSolidSubtangleMilestone':
            return (...args) => {
                // Unlike responses from other methods, getNodeInfo returns an object (https://iota.readme.io/reference#getnodeinfo)
                // However, we're only interested in preparing a quorum result for latestSolidSubtangleMilestone
                // So, transform the response into an array of latestSolidSubtangleMilestone -> [['XYZ...999'], ['XYZ...999'], ['XYZ...999']]
                const [results, ...restArgs] = args;

                const preparedResults = prepare(
                    map(
                        results,
                        (result) => (isUndefined(result) ? undefined : [result.latestSolidSubtangleMilestone]),
                    ),
                    // #prepare expects a requestPayloadSize argument
                    // Since there is no payload for getNodeInfo endpoint and we're only interested in getting a quorum for latestSolidSubtangleMilestone
                    // Pass requestPayloadSize -> size([latestSolidSubtanleMilestone]) which is basically 1
                    // This will also ensure that the quorum result is of size 1
                    ...map(restArgs, (arg, idx) => (idx === 0 ? idx + 1 : arg)),
                );

                const [latestSolidSubtangleMilestone] = preparedResults;

                return latestSolidSubtangleMilestone;
            };
        default:
            return () => {
                throw new Error(Errors.METHOD_NOT_SUPPORTED_FOR_QUORUM);
            };
    }
};

/**
 * Gets quorum results for provided method.
 *
 * @param {string} method
 * @param {array} syncedNodes
 * @param {array} [payload]
 * @param  {...any} [args]
 *
 * @return {Promise<array | object | string>}
 */
const getQuorum = (method, syncedNodes, payload, ...args) => {
    const requestArgs = [...(isEmpty(payload) ? [] : [payload]), ...(isEmpty(args) ? [] : args)];
    const iotaApiMethod = head(split(method, ':'));

    return rejectIfNotEnoughSyncedNodes(syncedNodes)
        .then(() =>
            Promise.all(
                map(
                    syncedNodes,
                    (provider) =>
                        new Promise((resolve) => {
                            getIotaInstance(provider).api[iotaApiMethod](
                                ...[...requestArgs, (err, result) => (err ? resolve(undefined) : resolve(result))],
                            );
                        }),
                ),
            ),
        )
        .then((results) => {
            const requestPayloadSize = size(payload);

            return prepareQuorumResults(method, ...args)(results, requestPayloadSize);
        });
};

/**
 *   Wrapper for quorum enabled iota methods
 *
 *   @method Quorum
 *   @param {array} quorumNodes
 *
 *   @returns {object}
 **/
export default function Quorum(quorumNodes) {
    let nodes = uniq(quorumNodes);

    if (size(nodes) < QUORUM_SIZE) {
        throw new Error(Errors.NOT_ENOUGH_QUORUM_NODES);
    }

    let syncedNodes = [];
    let lastSyncedAt = new Date();

    const findSyncedNodesIfNecessary = () => {
        const timeElapsed = (new Date() - lastSyncedAt) / 1000;

        if (isEmpty(syncedNodes) || timeElapsed >= QUORUM_NODES_SYNC_CHECKS_INTERVAL) {
            return findSyncedNodes(nodes, QUORUM_SIZE, syncedNodes).then((newSyncedNodes) => {
                syncedNodes = newSyncedNodes;
                lastSyncedAt = new Date();

                return newSyncedNodes;
            });
        }

        return Promise.resolve(syncedNodes);
    };

    return {
        /**
         * Set quorum nodes
         *
         * @method setNodes
         * @param {array} newNodes
         */
        setNodes(newNodes) {
            nodes = union(nodes, uniq(newNodes));
        },
        /**
         * Performs a quorum for wereAddressesSpentFrom api endpoint
         *
         * @method wereAddressesSpentFrom
         * @param {array} addresses
         *
         * @returns {Promise}
         */
        wereAddressesSpentFrom(addresses) {
            return isEmpty(addresses)
                ? Promise.resolve([])
                : findSyncedNodesIfNecessary().then((newSyncedNodes) =>
                      getQuorum('wereAddressesSpentFrom', newSyncedNodes, addresses),
                  );
        },
        /**
         * First performs a quorum for latestSolidSubtangleMilestone.
         * If quorum (for latestSolidSubtangleMilestone) is achieved then performs a quorum for getLatestInclusion api endpoint
         * Otherwise, raises an exception
         *
         * @method getLatestInclusion
         * @param {array} hashes
         *
         * @returns {Promise}
         */
        getLatestInclusion(hashes) {
            return isEmpty(hashes)
                ? Promise.resolve([])
                : findSyncedNodesIfNecessary().then((newSyncedNodes) =>
                      getQuorum('getNodeInfo:latestSolidSubtangleMilestone', newSyncedNodes)
                          // If nodes cannot agree on the latestSolidSubtangleMilestone
                          // No need to proceed further
                          .then(rejectIfEmptyHashTrytes)
                          .then((latestSolidSubtangleMilestone) =>
                              getQuorum('getInclusionStates', newSyncedNodes, hashes, [latestSolidSubtangleMilestone]),
                          ),
                  );
        },
        /**
         * First performs a quorum for latestSolidSubtangleMilestone.
         * If quorum (for latestSolidSubtangleMilestone) is achieved then performs a quorum for getBalances api endpoint
         * Otherwise, raises an exception
         *
         * @method getBalances
         * @param {array} addresses
         * @param {number} [threshold]
         *
         * @returns {Promise}
         */
        getBalances(addresses, threshold = DEFAULT_BALANCES_THRESHOLD) {
            return isEmpty(addresses)
                ? Promise.resolve([])
                : findSyncedNodesIfNecessary().then((newSyncedNodes) =>
                      getQuorum('getNodeInfo:latestSolidSubtangleMilestone', newSyncedNodes)
                          // If nodes cannot agree on the latestSolidSubtangleMilestone
                          // No need to proceed further
                          .then(rejectIfEmptyHashTrytes)
                          .then((latestSolidSubtangleMilestone) =>
                              getQuorum('getBalances:balances', newSyncedNodes, addresses, threshold, [
                                  latestSolidSubtangleMilestone,
                              ]),
                          ),
                  );
        },
    };
}

export { determineQuorumResult, fallbackToSafeResult, findSyncedNodes };
