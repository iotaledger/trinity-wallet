import IOTA from 'iota.lib.js';
//store.subscribe(listener)

const defaultNode = 'http://ceres.iota.community:14600/';

export const iota = new IOTA({
    provider: defaultNode
});


function listener() {
  let node = store.getStore().getState().settings.fullNode
  return node.settings.fullNode
}

export const convertFromTrytes = trytes => {
    trytes = trytes.replace(/9+$/, '');
    var message = iota.utils.fromTrytes(trytes);
    if (trytes == '') {
        return 'Empty';
    } else {
        return message;
    }
};

export const getBalances = addresses => {
    iota.api.getBalances(addresses, 1, (error, success) => {
        if (!error) {
            console.log(success);
        } else {
            console.log(error);
        }
    });
};
