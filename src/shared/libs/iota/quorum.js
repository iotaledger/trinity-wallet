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
import { isNodeHealthy, getIotaInstance, getApiTimeout } from './extendedApi';
import { QUORUM_THRESHOLD, QUORUM_SIZE, QUORUM_SYNC_CHECK_INTERVAL, DEFAULT_BALANCES_THRESHOLD } from '../../config';
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
 * Resolves only if provided trytes argument is not equal to empty hash trytes (999...999)
 *
 * @method rejectIfEmptyHashTrytes
 *
 * @param {string} trytes
 *
 * @returns {Promise<string>}
 */
const rejectIfEmptyHashTrytes = (trytes) => {
    if (trytes === EMPTY_HASH_TRYTES) {
        return Promise.reject(new Error(Errors.COULD_NOT_GET_QUORUM_FOR_LATEST_SOLID_SUBTANGLE_MILESTONE));
    }

    return Promise.resolve(trytes);
};

/**
 *   Determines quorum result for supported methods.
 *
 *   @method determineQuorumResult
 *   @param {array} validResults - Results from responsive nodes
 *   @param {number} quorumSize - Size of quorum nodes
 *
 *   @returns {function(string, [number]): {boolean | string}}
 **/
const determineQuorumResult = (validResults, quorumSize = QUORUM_SIZE) => {
    const { frequency, mostFrequent } = findMostFrequent(validResults);

    return (method, threshold = QUORUM_THRESHOLD) => {
        // Always calculate percentage out of quorum size i.e., all (responsive + unresponsive) nodes.
        const percentage = frequency[mostFrequent] / quorumSize * 100;

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
 *   For a list of nodes, find healthy (synced) nodes N, where size(N) === QUORUM_SIZE
 *
 *   @method findSyncedNodes
 *   @param {array} nodes
 *   @param {number} quorumSize
 *   @param {array} [syncedNodes = []]
 *   @param {array} [blacklistedNodes = []]
 *
 *   @returns {Promise}
 **/
const findSyncedNodes = (nodes, quorumSize, selectedNodes = [], blacklistedNodes = []) => {
    const numberOfSelectedNodes = size(selectedNodes);

    // Get all nodes that are not blacklisted (i.e. unsynced or unresponsive) and are not already selected
    const whitelistedNodes = filter(
        nodes,
        (node) => !includes(blacklistedNodes, node) && !includes(selectedNodes, node),
    );

    if (
        isEmpty(whitelistedNodes) &&
        // If there are no nodes that are whitelisted
        // And we still need more nodes to complete the (minimum) quorum size, then raise an exception
        numberOfSelectedNodes < quorumSize
    ) {
        return Promise.reject(new Error(Errors.NOT_ENOUGH_SYNCED_NODES));
    }

    const nodesToCheckSyncFor =
        // If we already have enough synced nodes, then just recheck if they are still synced
        numberOfSelectedNodes === quorumSize
            ? selectedNodes
            : // Otherwise, randomly choose the remaining nodes
              sampleSize(whitelistedNodes, quorumSize - numberOfSelectedNodes);

    return Promise.all(map(nodesToCheckSyncFor, (provider) => isNodeHealthy(provider).catch(() => undefined))).then(
        (results) => {
            // Categorise synced/unsynced nodes
            const { syncedNodes, unsyncedNodes } = transform(
                nodesToCheckSyncFor,
                (acc, node, idx) => (results[idx] ? acc.syncedNodes.push(node) : acc.unsyncedNodes.push(node)),
                { syncedNodes: [], unsyncedNodes: [] },
            );

            // If all nodes are synced, then return these nodes
            if (size(syncedNodes) === size(nodesToCheckSyncFor)) {
                return union(selectedNodes, syncedNodes);
            }

            // Otherwise, restart this process
            return findSyncedNodes(
                nodes,
                quorumSize,
                // Update selected nodes
                union(
                    // Filter selected nodes that are unsynced
                    filter(selectedNodes, (node) => !includes(unsyncedNodes, node)),
                    syncedNodes,
                ),
                // Add inactive nodes to blacklisted nodes
                [...blacklistedNodes, ...unsyncedNodes],
            );
        },
    );
};

/**
 * From a set of responses from quorum nodes, prepare a quorum result.
 * wereAddressesSpentFrom: prepare a quorum result for spend status of each address.
 * getBalances:balances: prepare a quorum result for balance of each address.
 * getInclusionStates: prepare a quorum result for inclusion state of each tail transaction hash.
 * getNodeInfo:latestSolidSubtangleMilestone: prepare a quorum result for latestSolidSubtangleMilestone of each quorum node.
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
        // Before determining the actual quorum result, filter results from unresponsive nodes.
        // See #getQuorum where we explicitly resolve undefined as a result from unresponsive nodes.
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
                // transform the quorum result into the original result format (https://iota.readme.io/reference#getbalances)
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
                    ...map(restArgs, (arg, idx) => (idx === 0 ? 1 : arg)),
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
                            getIotaInstance(provider, getApiTimeout(iotaApiMethod, payload)).api[iotaApiMethod](
                                ...[
                                    ...requestArgs,
                                    (err, result) =>
                                        err
                                            ? // In case there is an error (e.g: request timed out),
                                              // Instead of raising an error, return undefined as result.
                                              // Later (when quorum is result is determined), filter out these invalid results.
                                              resolve(undefined)
                                            : resolve(result),
                                ],
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

    let selectedNodes = [];
    let lastSyncedAt = new Date();

    const findSyncedNodesIfNecessary = () => {
        const timeElapsed = (new Date() - lastSyncedAt) / 1000;

        if (isEmpty(selectedNodes) || timeElapsed >= QUORUM_SYNC_CHECK_INTERVAL) {
            return findSyncedNodes(nodes, QUORUM_SIZE, selectedNodes).then((syncedNodes) => {
                selectedNodes = syncedNodes;
                lastSyncedAt = new Date();

                return selectedNodes;
            });
        }

        return Promise.resolve(selectedNodes);
    };

    return {
        /**
         * Set quorum nodes.
         *
         * @method setNodes
         * @param {array} newNodes
         */
        setNodes(newNodes) {
            nodes = union(nodes, uniq(newNodes));
        },
        /**
         * Performs a quorum for wereAddressesSpentFrom api endpoint.
         *
         * @method wereAddressesSpentFrom
         * @param {array} addresses
         *
         * @returns {Promise}
         */
        wereAddressesSpentFrom(addresses) {
            return isEmpty(addresses)
                ? Promise.resolve([])
                : findSyncedNodesIfNecessary().then((syncedNodes) =>
                      getQuorum('wereAddressesSpentFrom', syncedNodes, addresses),
                  );
        },
        /**
         * First performs a quorum for latestSolidSubtangleMilestone.
         * If quorum (for latestSolidSubtangleMilestone) is achieved then performs a quorum for getLatestInclusion api endpoint
         * Otherwise, raises an exception.
         *
         * @method getLatestInclusion
         * @param {array} hashes
         *
         * @returns {Promise}
         */
        getLatestInclusion(hashes) {
            return isEmpty(hashes)
                ? Promise.resolve([])
                : findSyncedNodesIfNecessary().then((syncedNodes) =>
                      getQuorum('getNodeInfo:latestSolidSubtangleMilestone', syncedNodes)
                          // If nodes cannot agree on the latestSolidSubtangleMilestone
                          // No need to proceed further.
                          .then(rejectIfEmptyHashTrytes)
                          .then((latestSolidSubtangleMilestone) =>
                              getQuorum('getInclusionStates', syncedNodes, hashes, [latestSolidSubtangleMilestone]),
                          ),
                  );
        },
        /**
         * First performs a quorum for latestSolidSubtangleMilestone.
         * If quorum (for latestSolidSubtangleMilestone) is achieved then performs a quorum for getBalances api endpoint
         * Otherwise, raises an exception.
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
                : findSyncedNodesIfNecessary().then((syncedNodes) =>
                      getQuorum('getNodeInfo:latestSolidSubtangleMilestone', syncedNodes)
                          // If nodes cannot agree on the latestSolidSubtangleMilestone
                          // No need to proceed further.
                          .then(rejectIfEmptyHashTrytes)
                          .then((latestSolidSubtangleMilestone) =>
                              getQuorum('getBalances:balances', syncedNodes, addresses, threshold, [
                                  latestSolidSubtangleMilestone,
                              ]),
                          ),
                  );
        },
    };
}

export { determineQuorumResult, fallbackToSafeResult, findSyncedNodes };
