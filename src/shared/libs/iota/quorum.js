import map from 'lodash/map';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import transform from 'lodash/transform';
import size from 'lodash/size';
import sampleSize from 'lodash/sampleSize';
import union from 'lodash/union';
import uniq from 'lodash/uniq';
import IOTA from 'iota.lib.js';
import { isNodeSynced } from './extendedApi';
import { QUORUM_THRESHOLD, QUORUM_SIZE, DEFAULT_BALANCES_THRESHOLD } from '../../config';
import { EMPTY_HASH_TRYTES } from './utils';
import { findMostFrequent } from '../utils';
import Errors from '../errors';

/**
 *   Determines quorum result for supported methods.
 *
 *   @method determineQuorumResult
 *   @param {array} validResults
 *   @param {number} faultyResultCount
 *
 *   @returns {function}
 **/
const determineQuorumResult = (validResults, faultyResultCount = 0) => {
    const { frequency, mostFrequent } = findMostFrequent(validResults);

    return (method, threshold) => {
        // Include faulty result count while determining percentage
        const percentage = frequency[mostFrequent] / (size(validResults) + faultyResultCount) * 100;

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
        getBalances: '0',
        latestSolidSubtangleMilestone: EMPTY_HASH_TRYTES,
    };

    return allowedMethodsMap[method];
};

/**
 *   For a list of nodes, find healthy nodes with size equals to minimum quorum nodes size
 *
 *   @method findSyncedNodes
 *   @param {array} nodes
 *   @param {array} [syncedNodes = []]
 *   @param {array} [blacklistedNodes = []]
 *
 *   @returns {Promise}
 **/
const findSyncedNodes = (nodes, syncedNodes = [], blacklistedNodes = []) => {
    const sizeOfSyncedNodes = size(syncedNodes);
    const whitelistedNodes = filter(nodes, (node) => !includes(blacklistedNodes, node) && !includes(syncedNodes, node));

    if (isEmpty(whitelistedNodes)) {
        return Promise.reject(new Error(Errors.NOT_ENOUGH_HEALTHY_QUORUM_NODES));
    }

    const selectedNodes =
        sizeOfSyncedNodes === QUORUM_SIZE ? syncedNodes : sampleSize(whitelistedNodes, QUORUM_SIZE - sizeOfSyncedNodes);

    return Promise.all(map(selectedNodes, (provider) => isNodeSynced(provider).catch(() => undefined))).then(
        (results) => {
            const { activeNodes, inactiveNodes } = transform(
                selectedNodes,
                (acc, node, idx) => (results[idx] ? acc.activeNodes.push(node) : acc.inactiveNodes.push(node)),
                { activeNodes: [], inactiveNodes: [] },
            );

            if (size(activeNodes) === size(selectedNodes)) {
                return [...syncedNodes, ...activeNodes];
            }

            return findSyncedNodes(
                nodes,
                // Add active nodes to synced nodes
                [...syncedNodes, ...activeNodes],
                // Add inactive nodes to blacklisted nodes
                [...blacklistedNodes, ...inactiveNodes],
            );
        },
    );
};

/**
 *   From a list of synced nodes, compute a quorum result for wereAddressesSpentFrom iota api
 *
 *   @method getQuorumForWereAddressesSpentFrom
 *   @param {array} payload - Addresses
 *   @param {array} syncedNodes
 *
 *   @returns {Promise}
 **/
const getQuorumForWereAddressesSpentFrom = (payload, syncedNodes) => {
    if (isEmpty(syncedNodes)) {
        return Promise.reject(new Error(Errors.NO_SYNCED_NODES_FOR_QUORUM));
    }

    const requestPayloadSize = size(payload);

    return Promise.all(
        map(
            syncedNodes,
            (provider) =>
                new Promise((resolve, reject) => {
                    new IOTA({ provider }).api.wereAddressesSpentFrom(
                        payload,
                        (err, spendStatuses) => (err ? reject(err) : resolve(spendStatuses)),
                    );
                }),
        ),
    ).then((results) => {
        const validResults = filter(results, (result) => !isUndefined(result));
        const invalidResultsCount = size(results) - size(validResults);

        let idx = 0;
        const quorumResult = [];

        while (idx < requestPayloadSize) {
            /* eslint-disable no-loop-func */
            quorumResult.push(
                determineQuorumResult(map(validResults, (result) => result[idx]), invalidResultsCount)(
                    'wereAddressesSpentFrom',
                    QUORUM_THRESHOLD,
                ),
            );
            /* eslint-enable no-loop-func */

            idx += 1;
        }

        return quorumResult;
    });
};

/**
 *   From a list of synced nodes, compute a quorum result for getLatestInclusion iota api
 *
 *   @method getQuorumForGetLatestInclusion
 *   @param {array} payload - Hashes
 *   @param {array} tips
 *   @param {array} syncedNodes
 *
 *   @returns {Promise}
 **/
const getQuorumForGetLatestInclusion = (payload, tips, syncedNodes) => {
    if (isEmpty(syncedNodes)) {
        return Promise.reject(new Error(Errors.NO_SYNCED_NODES_FOR_QUORUM));
    }

    const requestPayloadSize = size(payload);

    return Promise.all(
        map(
            syncedNodes,
            (provider) =>
                new Promise((resolve, reject) => {
                    new IOTA({ provider }).api.getInclusionStates(
                        payload,
                        tips,
                        (err, states) => (err ? reject(err) : resolve(states)),
                    );
                }),
        ),
    ).then((results) => {
        const validResults = filter(results, (result) => !isUndefined(result));
        const invalidResultsCount = size(results) - size(validResults);

        let idx = 0;
        const quorumResult = [];

        while (idx < requestPayloadSize) {
            /* eslint-disable no-loop-func */
            quorumResult.push(
                determineQuorumResult(map(validResults, (result) => result[idx]), invalidResultsCount)(
                    'getInclusionStates',
                    QUORUM_THRESHOLD,
                ),
            );
            /* eslint-enable no-loop-func */

            idx += 1;
        }

        return quorumResult;
    });
};

/**
 *   From a list of synced nodes, compute a quorum result for getBalances iota api
 *
 *   @method getQuorumForGetBalances
 *   @param {array} payload - Addresses
 *   @param {array} syncedNodes
 *
 *   @returns {Promise}
 **/
const getQuorumForGetBalances = (payload, tips, syncedNodes) => {
    if (isEmpty(syncedNodes)) {
        return Promise.reject(new Error(Errors.NO_SYNCED_NODES_FOR_QUORUM));
    }

    const requestPayloadSize = size(payload);

    return Promise.all(
        map(
            syncedNodes,
            (provider) =>
                new Promise((resolve, reject) => {
                    new IOTA({ provider }).api.getBalances(
                        payload,
                        DEFAULT_BALANCES_THRESHOLD,
                        tips,
                        (err, states) => (err ? reject(err) : resolve(states)),
                    );
                }),
        ),
    ).then((results) => {
        const validResults = filter(results, (result) => !isUndefined(result));
        const invalidResultsCount = size(results) - size(validResults);

        let idx = 0;
        const quorumResult = {
            references: tips,
            balances: [],
        };

        while (idx < requestPayloadSize) {
            /* eslint-disable no-loop-func */
            quorumResult.balances.push(
                determineQuorumResult(map(validResults, ({ balances }) => balances[idx]), invalidResultsCount)(
                    'getBalances',
                    QUORUM_THRESHOLD,
                ),
            );
            /* eslint-enable no-loop-func */

            idx += 1;
        }

        return quorumResult;
    });
};

/**
 *   For a list of synced nodes, compute a quorum result for latestSolidSubtangleMilestone
 *
 *   @method getQuorumForLatestSolidSubtangleMilestone
 *   @param {array} syncedNodes
 *
 *   @returns {Promise}
 **/
const getQuorumForLatestSolidSubtangleMilestone = (syncedNodes) => {
    if (isEmpty(syncedNodes)) {
        return Promise.reject(new Error(Errors.NO_SYNCED_NODES_FOR_QUORUM));
    }

    return Promise.all(
        map(
            syncedNodes,
            (provider) =>
                new Promise((resolve, reject) => {
                    new IOTA({ provider }).api.getNodeInfo((err, info) => (err ? reject(err) : resolve(info)));
                }),
        ),
    ).then((results) => {
        const validResults = filter(results, (result) => !isUndefined(result));
        const invalidResultsCount = size(results) - size(validResults);

        // Get quorum result for latest solid subtangle milestone
        const latestSolidSubtangleMilestone = determineQuorumResult(
            map(validResults, (nodeInfo) => nodeInfo.latestSolidSubtangleMilestone),
            invalidResultsCount,
        )('latestSolidSubtangleMilestone', QUORUM_THRESHOLD);

        // If nodes cannot agree on the latestSolidSubtangleMilestone
        // Then just throw an exception
        if (latestSolidSubtangleMilestone === EMPTY_HASH_TRYTES) {
            // TODO (laumair): Might need to replace the error message here.
            throw new Error(Errors.NOT_ENOUGH_HEALTHY_QUORUM_NODES);
        }

        return latestSolidSubtangleMilestone;
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

    // TODO validate min size of nodes
    let syncedNodes = [];
    let lastSyncedAt = new Date();

    const findSyncedNodesIfNecessary = () => {
        const timeElapsed = (new Date() - lastSyncedAt) / 1000;

        if (isEmpty(syncedNodes) || timeElapsed >= 120) {
            return findSyncedNodes(nodes, syncedNodes).then((newSyncedNodes) => {
                syncedNodes = newSyncedNodes;
                lastSyncedAt = new Date();

                return newSyncedNodes;
            });
        }

        return Promise.resolve(syncedNodes);
    };

    return {
        setNodes(newNodes) {
            nodes = union(nodes, uniq(newNodes));
        },
        wereAddressesSpentFrom(addresses) {
            return findSyncedNodesIfNecessary().then((newSyncedNodes) =>
                getQuorumForWereAddressesSpentFrom(addresses, newSyncedNodes),
            );
        },
        getLatestInclusion(hashes) {
            return findSyncedNodesIfNecessary().then((newSyncedNodes) =>
                getQuorumForLatestSolidSubtangleMilestone(newSyncedNodes).then((latestSolidSubtangleMilestone) =>
                    getQuorumForGetLatestInclusion(hashes, [latestSolidSubtangleMilestone], newSyncedNodes),
                ),
            );
        },
        getBalances(addresses) {
            return findSyncedNodesIfNecessary().then((newSyncedNodes) =>
                getQuorumForLatestSolidSubtangleMilestone(newSyncedNodes).then((latestSolidSubtangleMilestone) =>
                    getQuorumForGetBalances(addresses, [latestSolidSubtangleMilestone], newSyncedNodes),
                ),
            );
        },
    };
}

export { determineQuorumResult, fallbackToSafeResult, findSyncedNodes };
