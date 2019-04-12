const fork = require('child_process').fork;
const path = require('path');
const EntangledNode = require('entangled-node');


let timeout = null;

/**
 * Spawn a child process and return result in async
 * @param {object} payload - Payload to send to the child process
 * @returns {Promise}
 */
const exec = (payload) => {
    return new Promise((resolve, reject) => {
        const child = fork(path.resolve(__dirname, 'Entangled.js'));

        child.on('message', (message) => {
            resolve(message);

            clearTimeout(timeout);
            child.kill();
        });

        timeout = setTimeout(() => {
            reject('Timeout');
            child.kill();
        }, 30000);

        child.send(payload);
    });
};

/**
 * If module called as a child process, execute requested function and return response
 */
process.on('message', async (data) => {
    const payload = JSON.parse(data);

    if (payload.job === 'pow') {
        const pow = await EntangledNode.powTrytesFunc(payload.trytes, payload.mwm);
        process.send(pow);
    }

    if (payload.job === 'batchedPow') {
        const pow = await EntangledNode.powBundleFunc(
            payload.trytes,
            payload.trunkTransaction,
            payload.branchTransaction,
            payload.mwm,
        );
        process.send(pow);
    }

    if (payload.job === 'gen') {
        const address = await EntangledNode.genAddressTritsFunc(payload.seed, payload.index, payload.security);
        process.send(address);
    }
}); 

const Entangled = {
    powFn: async (trytes, mwm) => {
        return await exec(JSON.stringify({ job: 'pow', trytes, mwm }));
    },
    batchedPowFn: async (trytes, trunkTransaction, branchTransaction, mwm) => {
        return await exec(JSON.stringify({ job: 'batchedPow', trytes, trunkTransaction, branchTransaction, mwm }));
    },
    genFn: async (seed, index, security) => {
        return await exec(JSON.stringify({ job: 'gen', seed, index, security }));
    },
};

module.exports = Entangled;
