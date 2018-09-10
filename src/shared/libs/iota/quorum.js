import concat from 'lodash/concat';
import map from 'lodash/map';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import transform from 'lodash/transform';
import some from 'lodash/some';
import size from 'lodash/size';
import sampleSize from 'lodash/sampleSize';
import union from 'lodash/union';
import uniq from 'lodash/uniq';
import { wereAddressesSpentFromAsync, isNodeSynced } from './extendedApi';
import { QUORUM_THRESHOLD, MIN_QUORUM_NODES } from '../../config';
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
 *   @returns {any}
 **/
const fallbackToSafeResult = (method) => {
    const allowedMethodsMap = {
        wereAddressesSpentFrom: true,
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
 *   @param {boolean} [checkHealthOfExistingSyncedNodes = false]
 *   @returns {Promise}
 **/
const findSyncedNodes = (nodes, syncedNodes = [], blacklistedNodes = [], checkHealthOfExistingSyncedNodes = false) => {
    const whitelistedNodes = filter(nodes, (node) => !includes(blacklistedNodes, node) && !includes(syncedNodes, node));
    const hasNoWhitelistedNode = size(whitelistedNodes) === 0;

    if (hasNoWhitelistedNode) {
        return Promise.reject(new Error(Errors.NOT_ENOUGH_QUORUM_NODES));
    }

    // If checking for existing synced nodes, validate the number of existing synced nodes.
    if (checkHealthOfExistingSyncedNodes && size(syncedNodes) < MIN_QUORUM_NODES) {
        return Promise.reject(new Error(Errors.NOT_ENOUGH_SYNCED_NODES));
    }

    const selectedNodes = checkHealthOfExistingSyncedNodes
        ? syncedNodes
        : sampleSize(whitelistedNodes, MIN_QUORUM_NODES - size(syncedNodes));

    return Promise.all(map(selectedNodes, (provider) => isNodeSynced(provider).catch(() => undefined))).then(
        (results) => {
            const { activeNodes, inactiveNodes } = transform(
                selectedNodes,
                (acc, node, idx) => (results[idx] ? acc.activeNodes.push(node) : acc.inactiveNodes.push(node)),
                { activeNodes: [], inactiveNodes: [] },
            );

            if (size(activeNodes) === size(selectedNodes) && some(results, (isSynced) => isSynced)) {
                return union(syncedNodes, activeNodes);
            }

            const allSyncedNodes = checkHealthOfExistingSyncedNodes
                ? filter(syncedNodes, (node) => !includes(inactiveNodes, node))
                : concat([], syncedNodes, activeNodes);
            const allBlacklistedNodes = concat([], blacklistedNodes, inactiveNodes);

            return findSyncedNodes(nodes, allSyncedNodes, allBlacklistedNodes);
        },
    );
};

/**
 *   From a list of synced nodes, compute a quorum result for wereAddressesSpentFrom iota api
 *
 *   @method getQuorumForWereAddressesSpentFrom
 *   @param {array} payload - Addresses
 *   @param {array} syncedNodes
 *   @returns {Promise}
 **/
const getQuorumForWereAddressesSpentFrom = (payload, syncedNodes) => {
    if (isEmpty(syncedNodes)) {
        Promise.reject(new Error(Errors.NO_SYNCED_NODES_FOR_QUORUM));
    }

    const requestPayloadSize = size(payload);

    return Promise.all(
        map(syncedNodes, (provider) => wereAddressesSpentFromAsync(provider)(payload).catch(() => undefined)),
    ).then((results) => {
        const isNotUndefined = (value) => !isUndefined(value);
        const validResults = filter(results, isNotUndefined);
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
 *   Wrapper for quorum enabled iota methods
 *
 *   @method Quorum
 *   @param {array} quorumNodes
 *   @returns {object}
 **/
export default function Quorum(quorumNodes) {
    const nodes = uniq(quorumNodes);

    // TODO validate min size of nodes
    let syncedNodes = [];

    return {
        wereAddressesSpentFrom: (addresses) =>
            findSyncedNodes(nodes, syncedNodes, [], !isEmpty(syncedNodes)).then((newSyncedNodes) => {
                // FIXME: Decouple setting syncedNodes within this API
                syncedNodes = newSyncedNodes;

                return getQuorumForWereAddressesSpentFrom(addresses, syncedNodes);
            }),
    };
}

export { determineQuorumResult, fallbackToSafeResult, findSyncedNodes };
