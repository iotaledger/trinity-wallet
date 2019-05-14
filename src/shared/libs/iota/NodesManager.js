import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import Errors from '../errors';
import { getRandomNodes } from './utils';
import { DEFAULT_RETRIES } from '../../config';

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

        const randomNodes = getRandomNodes(nodes, retryAttempts, [priorityNode]);

        const retryNodes = [priorityNode, ...randomNodes];

        return (promiseFunc) => {
            const execute = (...args) => {
                if (isUndefined(retryNodes[attempt])) {
                    return Promise.reject(new Error(Errors.NO_NODE_TO_RETRY));
                }

                return promiseFunc(retryNodes[attempt], quorum.enabled)(...args)
                    .then((result) => ({ node: retryNodes[attempt], result }))
                    .catch((err) => {
                        // Abort retries on user cancalled Ledger action
                        if (err === Errors.LEDGER_CANCELLED) {
                            throw new Error(Errors.LEDGER_CANCELLED);
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
