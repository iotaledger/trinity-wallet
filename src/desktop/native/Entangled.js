const fork = require('child_process').fork;
const path = require('path');
const EntangledNode = require('entangled-node');

let timeout = null;

/**
 * Tryte trit mapping
 */
const trytesTrits = [
    [0, 0, 0],
    [1, 0, 0],
    [-1, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
    [-1, -1, 1],
    [0, -1, 1],
    [1, -1, 1],
    [-1, 0, 1],
    [0, 0, 1],
    [1, 0, 1],
    [-1, 1, 1],
    [0, 1, 1],
    [1, 1, 1],
    [-1, -1, -1],
    [0, -1, -1],
    [1, -1, -1],
    [-1, 0, -1],
    [0, 0, -1],
    [1, 0, -1],
    [-1, 1, -1],
    [0, 1, -1],
    [1, 1, -1],
    [-1, -1, 0],
    [0, -1, 0],
    [1, -1, 0],
    [-1, 0, 0],
];

const tritStrings = trytesTrits.map((trit) => trit.toString());


/**
 * Convert trit array to string
 * @param {array} trits - Input trit array
 * @returns {string} Output string
 */
const tritsToChars = (trits) => {
    let seed = '';
    for (let i = 0; i < trits.length; i += 3) {
        const trit = trits.slice(i, i + 3).toString();
        for (let x = 0; x < tritStrings.length; x++) {
            if (tritStrings[x] === trit) {
                seed += '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(x);
            }
        }
    }
    return seed;
};

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
        const pow = await EntangledNode.powFunc(payload.trytes, payload.mwm);
        process.send(pow);
    }

    if (payload.job === 'gen') {
        const seedString = tritsToChars(payload.seed);
        const address = await EntangledNode.genFunc(seedString, payload.index, payload.security);
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

module.exports = Entangled;
