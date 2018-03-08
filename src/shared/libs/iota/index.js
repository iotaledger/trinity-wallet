import IOTA from './lib.promisified';
import { nodes, defaultNode } from '../../config';
import { checkNode as _checkNode } from './multinode';

export const iota = new IOTA({ provider: defaultNode });

export const changeIotaNode = (provider) => iota.changeNode({ provider });

export const getRandomNode = () => {
    const x = Math.floor(Math.random() * nodes.length);

    return nodes[x];
};

export const checkNode = (cb) => {
    // use checkNode from multinode
    _checkNode(iota, cb);
};
