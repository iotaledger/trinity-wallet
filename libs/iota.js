import IOTA from 'iota.lib.js';

const defaultNode = 'http://service.iotasupport.com:14265';


export var iota = new IOTA({
  provider: defaultNode,
});
