import IOTA from 'iota.lib.js';
import 'proxy-polyfill';
import Quorum from './quorum';
import { defaultNode, nodes, DEFAULT_NODE_REQUEST_TIMEOUT } from '../../config';

const iotaAPI = new IOTA({ provider: defaultNode });
export const quorum = new Quorum(nodes);

// Set node request timeout
iotaAPI.api.setApiTimeout(DEFAULT_NODE_REQUEST_TIMEOUT);

// Later used by the checkNodePatched function
let unproxiedNodeInfo = iotaAPI.api.getNodeInfo.bind(iotaAPI.api);

export const changeIotaNode = (provider) => {
    iotaAPI.changeNode({ provider });
    // grab the unproxied version of getNodeInfo
    unproxiedNodeInfo = iotaAPI.api.getNodeInfo.bind(iotaAPI.api);
    // re-inject proxy
    injectAPIProxy();
};

// Holds the auto. node switching configuration and callbacks
class AutoNodeSwitchingConfig {
    autoSwitch = true;
    callbacks = [];
}

const autoNodeSwitchingConfig = new AutoNodeSwitchingConfig();
export const SwitchingConfig = autoNodeSwitchingConfig;

// This function uses a non proxied getNodeInfo function invocation
// and returns a promise instead of using a callback based approach.
function checkNodePatched() {
    return new Promise((resolve, reject) => {
        unproxiedNodeInfo((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

/**
 * This object automatically intercepts function calls to the iota API library
 * to ensure that the remote IRI node is actually online before executing an API call.
 * If the node doesn't return a reply to getNodeInfo, a new random node is selected from the
 * available nodes. The handler makes the assumption, that the newly selected node is online and
 * if not, it will again change up on the next function call.
 * If a function doesn't use a callback as its last argument, we assume that it is a synchronous
 * library function and thereby no interception is done.
 * @type {{get: autoNodeSwitcher.get}}
 */
const autoNodeSwitchHandler = {
    get: function(target, propKey) {
        const propValue = target[propKey];
        if (typeof propValue !== 'function') {
            return propValue;
        }
        return function(...args) {
            let originalCallback;
            if (args.length) {
                // In all functions which communicate with IRI,
                // the callback function is the last argument
                originalCallback = args[args.length - 1];
            }
            if (!autoNodeSwitchingConfig.autoSwitch || !originalCallback || typeof originalCallback !== 'function') {
                return propValue.apply(target, args);
            }

            // Here it doesn't matter if we don't return anything anymore
            // as all functions use a callback.
            // We don't use an async/await pattern here, because it breaks
            // the handler up on node change (reason unknown).
            checkNodePatched()
                .then(() => {
                    // Ok, node is online
                    propValue.apply(target, args);
                })
                .catch(() => {
                    // Switch to another node and then apply function
                    let newNode;
                    for (;;) {
                        const randomNode = getRandomNode(nodes);
                        // Check whether same node was chosen
                        if (iotaAPI.provider === randomNode) {
                            continue;
                        }
                        newNode = randomNode;
                        break;
                    }

                    // Actually change node, (this also re-injects this proxy handler)
                    changeIotaNode(newNode);

                    // Call all handlers for a node switch
                    autoNodeSwitchingConfig.callbacks.forEach((cb) => cb(newNode));
                    propValue.apply(target, args);
                });
        };
    },
};

// patch the auto node switcher into the API object
function injectAPIProxy() {
    const args = [iotaAPI.api, autoNodeSwitchHandler];
    iotaAPI.api = new Proxy(...args);
}

export const getRandomNode = (nodesList) => {
    const x = Math.floor(Math.random() * nodesList.length);

    return nodesList[x];
};

injectAPIProxy();
export const iota = iotaAPI;
