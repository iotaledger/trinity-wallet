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
import {
    QUORUM_THRESHOLD,
    QUORUM_SIZE,
    QUORUM_NODES_SYNC_CHECKS_INTERVAL,
    DEFAULT_BALANCES_THRESHOLD,
} from '../../config';
import { EMPTY_HASH_TRYTES, EMPTY_TRANSACTION_TRYTES } from './utils';
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
 *   Determines quorum result for supported methods.
 *
 *   @method determineQuorumResult
 *   @param {array} validResults
 *   @param {number} faultyResultCount
 *
 *   @returns {function}
 **/
const determineQuorumResult = (validResults, quorumSize = QUORUM_SIZE) => {
    const { frequency, mostFrequent } = findMostFrequent(validResults);

    return (method, threshold) => {
        // Include faulty result count while determining percentage
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
        getBalances: '0',
        getTrytes: EMPTY_TRANSACTION_TRYTES,
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
const findSyncedNodes = (nodes, quorumSize, syncedNodes = [], blacklistedNodes = []) => {
    const sizeOfSyncedNodes = size(syncedNodes);
    const whitelistedNodes = filter(nodes, (node) => !includes(blacklistedNodes, node) && !includes(syncedNodes, node));

    if (isEmpty(whitelistedNodes)) {
        return Promise.reject(new Error(Errors.NOT_ENOUGH_HEALTHY_QUORUM_NODES));
    }

    const selectedNodes =
        sizeOfSyncedNodes === quorumSize ? syncedNodes : sampleSize(whitelistedNodes, quorumSize - sizeOfSyncedNodes);

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
                quorumSize,
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
    const requestPayloadSize = size(payload);

    return rejectIfNotEnoughSyncedNodes(syncedNodes)
        .then(() =>
            Promise.all(
                map(
                    syncedNodes,
                    (provider) =>
                        new Promise((resolve) => {
                            new IOTA({ provider }).api.wereAddressesSpentFrom(
                                payload,
                                (err, spendStatuses) => (err ? resolve(undefined) : resolve(spendStatuses)),
                            );
                        }),
                ),
            ),
        )
        .then((results) => {
            const validResults = filter(results, (result) => !isUndefined(result));

            let idx = 0;
            const quorumResult = [];

            while (idx < requestPayloadSize) {
                /* eslint-disable no-loop-func */
                quorumResult.push(
                    determineQuorumResult(map(validResults, (result) => result[idx]))(
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
    const requestPayloadSize = size(payload);

    return rejectIfNotEnoughSyncedNodes(syncedNodes)
        .then(() =>
            Promise.all(
                map(
                    syncedNodes,
                    (provider) =>
                        new Promise((resolve) => {
                            new IOTA({ provider }).api.getInclusionStates(
                                payload,
                                tips,
                                (err, states) => (err ? resolve(undefined) : resolve(states)),
                            );
                        }),
                ),
            ),
        )
        .then((results) => {
            const validResults = filter(results, (result) => !isUndefined(result));

            let idx = 0;
            const quorumResult = [];

            while (idx < requestPayloadSize) {
                /* eslint-disable no-loop-func */
                quorumResult.push(
                    determineQuorumResult(map(validResults, (result) => result[idx]))(
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
 *   @param {number} threshold
 *   @param {array} syncedNodes
 *
 *   @returns {Promise}
 **/
const getQuorumForGetBalances = (payload, threshold, tips, syncedNodes) => {
    const requestPayloadSize = size(payload);

    return rejectIfNotEnoughSyncedNodes(syncedNodes)
        .then(() =>
            Promise.all(
                map(
                    syncedNodes,
                    (provider) =>
                        new Promise((resolve) => {
                            new IOTA({ provider }).api.getBalances(
                                payload,
                                threshold,
                                tips,
                                (err, states) => (err ? resolve(undefined) : resolve(states)),
                            );
                        }),
                ),
            ),
        )
        .then((results) => {
            const validResults = filter(results, (result) => !isUndefined(result));

            let idx = 0;
            const quorumResult = {
                references: tips,
                balances: [],
            };

            while (idx < requestPayloadSize) {
                /* eslint-disable no-loop-func */
                quorumResult.balances.push(
                    determineQuorumResult(map(validResults, ({ balances }) => balances[idx]))(
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
 *   From a list of synced nodes, compute a quorum result for getTrytes iota api
 *
 *   @method getQuorumForGetTrytes
 *   @param {array} payload - hashes
 *   @param {array} syncedNodes
 *
 *   @returns {Promise}
 **/
const getQuorumForGetTrytes = (payload, syncedNodes) => {
    const requestPayloadSize = size(payload);

    return rejectIfNotEnoughSyncedNodes(syncedNodes)
        .then(() =>
            Promise.all(
                map(
                    syncedNodes,
                    (provider) =>
                        new Promise((resolve) => {
                            new IOTA({ provider }).api.getTrytes(
                                payload,
                                (err, trytes) => (err ? resolve(undefined) : resolve(trytes)),
                            );
                        }),
                ),
            ),
        )
        .then((results) => {
            const validResults = filter(results, (result) => !isUndefined(result));

            let idx = 0;
            const quorumResult = [];

            while (idx < requestPayloadSize) {
                /* eslint-disable no-loop-func */
                quorumResult.push(
                    determineQuorumResult(map(validResults, (result) => result[idx]))('getTrytes', QUORUM_THRESHOLD),
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
    return rejectIfNotEnoughSyncedNodes(syncedNodes)
        .then(() =>
            Promise.all(
                map(
                    syncedNodes,
                    (provider) =>
                        new Promise((resolve) => {
                            new IOTA({ provider }).api.getNodeInfo(
                                (err, info) => (err ? resolve(undefined) : resolve(info)),
                            );
                        }),
                ),
            ),
        )
        .then((results) => {
            const validResults = filter(results, (result) => !isUndefined(result));

            // Get quorum result for latest solid subtangle milestone
            const latestSolidSubtangleMilestone = determineQuorumResult(
                map(validResults, (nodeInfo) => nodeInfo.latestSolidSubtangleMilestone),
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
        getBalances(addresses, threshold = DEFAULT_BALANCES_THRESHOLD) {
            return findSyncedNodesIfNecessary().then((newSyncedNodes) =>
                getQuorumForLatestSolidSubtangleMilestone(newSyncedNodes).then((latestSolidSubtangleMilestone) =>
                    getQuorumForGetBalances(addresses, threshold, [latestSolidSubtangleMilestone], newSyncedNodes),
                ),
            );
        },
        getTrytes(hashes) {
            return findSyncedNodesIfNecessary().then((newSyncedNodes) => getQuorumForGetTrytes(hashes, newSyncedNodes));
        },
    };
}

export { determineQuorumResult, fallbackToSafeResult, findSyncedNodes };
