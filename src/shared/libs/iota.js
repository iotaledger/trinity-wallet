import IOTA from 'iota.lib.js';

const defaultNode = 'http://node01.iotatoken.nl:14265';


export var iota = new IOTA({
  provider: defaultNode,
});
