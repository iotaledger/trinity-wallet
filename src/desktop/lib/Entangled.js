const { fork } = require('child_process');
const path = require('path');
const { powFunc, genFunc } = require('entangled-node');

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
        const pow = await powFunc(payload.trytes, payload.mwm);
        process.send(pow);
    }

    if (payload.job === 'gen') {
        const seedString = payload.seed.map((byte) => byteToChar(byte)).join('');
        const address = await genFunc(seedString, payload.index, payload.security);
        process.send(address);
    }
});

const Entangled = {
    powFn: async (trytes, mwm) => {
        return await exec(JSON.stringify({ job: 'pow', trytes, mwm }));
    },
    genFn: async (seed, index, security) => {
        return await exec(JSON.stringify({ job: 'gen', seed, index, security }));
    },
};

/**
 * Convert single character byte to string
 * @param {number} byte - Input byte
 * @returns {string} Output character
 */
const byteToChar = (byte) => {
    return '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(byte % 27);
};

module.exports = Entangled;
