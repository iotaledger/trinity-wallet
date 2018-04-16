import IOTA from 'iota.lib.js';
import { nodes, defaultNode } from '../../config';

export const iota = new IOTA({ provider: defaultNode });

export const changeIotaNode = (provider) => iota.changeNode({ provider });

export const getRandomNode = () => {
    const x = Math.floor(Math.random() * nodes.length);

    return nodes[x];
};

export const checkNode = (cb) => {
    iota.api.getNodeInfo((error, success) => {
        if (error) {
            cb(error);
        } else {
            cb(null, success);
        }
    });
};
