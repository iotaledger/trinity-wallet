import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import unionBy from 'lodash/unionBy';
import Errors from '../errors';
import { getRandomNodes } from './utils';
import { DEFAULT_RETRIES } from '../../config';
import { changeNode } from '../../actions/settings';
import store from '../../store';

export default class NodesManager {
    /**
     * @method constructor
     *
     * @param {object} config - See selectors/global/#nodesConfigurationFactory
     *
     * @returns {void}
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Retries IOTA api calls on different nodes.
     * Always tries to first connect to the priority node
     *
     * @method withRetries
     *
     * @param {array | function} [failureCallbacks]
     * @param {number} retryAttempts
     *
     * @returns {function(function): function(...[*]): Promise}
     */
    withRetries(failureCallbacks, retryAttempts = DEFAULT_RETRIES) {
        const { priorityNode, primaryNode, nodeAutoSwitch, nodes, quorum } = this.config;
        let attempt = 0;
        let executedCallback = false;
        const remotePoW = store.getState().settings.remotePoW;
        const randomNodes = getRandomNodes(nodes, retryAttempts, [primaryNode], remotePoW);
        const retryNodes = unionBy(remotePoW === priorityNode.pow && [priorityNode], randomNodes, 'url');
        // Abort retries on these errors
        const cancellationErrors = [Errors.LEDGER_CANCELLED, Errors.CANNOT_TRANSITION_ADDRESSES_WITH_ZERO_BALANCE];

        return (promiseFunc) => {
            const execute = (...args) => {
                if (isUndefined(retryNodes[attempt])) {
                    return Promise.reject(new Error(Errors.NO_NODE_TO_RETRY));
                }

                return promiseFunc(retryNodes[attempt], quorum.enabled)(...args)
                    .then((result) => {
                        store.dispatch(changeNode(retryNodes[attempt]));

                        return result;
                    })
                    .catch((err) => {
                        if (includes(cancellationErrors, err) || includes(cancellationErrors, err.message)) {
                            throw err;
                        }

                        // If a function is passed as failure callback
                        // Just trigger it once.
                        if (isFunction(failureCallbacks)) {
                            if (!executedCallback) {
                                executedCallback = true;
                                failureCallbacks();
                            }
                            // If an array of functions is passed
                            // Execute callback on each failure
                        } else if (isArray(failureCallbacks)) {
                            if (isFunction(failureCallbacks[attempt])) {
                                failureCallbacks[attempt]();
                            }
                        }

                        attempt += 1;

                        if (attempt < retryAttempts) {
                            return execute(...args);
                        }

                        throw err;
                    });
            };

            // If auto node switching is disabled, just connect to the selected (primary) node
            if (!nodeAutoSwitch) {
                return (...args) => promiseFunc(primaryNode, quorum.enabled)(...args);
            }

            return execute;
        };
    }
}
