import assign from 'lodash/assign';
import IOTA from 'iota.lib.js';
import 'proxy-polyfill';
import Quorum from './quorum';
import { DEFAULT_NODE, DEFAULT_NODES, DEFAULT_NODE_REQUEST_TIMEOUT, QUORUM_SIZE } from '../../config';

/** Globally defined IOTA instance */
const iotaAPI = new IOTA(
    assign({}, DEFAULT_NODE, {
        provider: DEFAULT_NODE.url,
    }),
);

// Set node request timeout
iotaAPI.api.setApiTimeout(DEFAULT_NODE_REQUEST_TIMEOUT);

/** Globally defined Quorum instance */
export const quorum = new Quorum({
    nodes: DEFAULT_NODES,
    quorumSize: QUORUM_SIZE,
});

/**
 * Changes IOTA node
 *
 * @method changeIotaNode
 *
 * @param {object} settings
 *
 * @returns {void}
 */
export const changeIotaNode = (settings) => {
    iotaAPI.changeNode(settings);
};

export const iota = iotaAPI;
