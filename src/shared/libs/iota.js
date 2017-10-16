import IOTA from 'iota.lib.js';

const defaultNode = 'https://node.tangle.works:443';

export var iota = new IOTA({
    provider: defaultNode,
});
