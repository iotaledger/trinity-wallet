import IOTA from './lib.promisified';
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
            console.log(error);
        } else {
            cb(null, success);
        }
    });
};
