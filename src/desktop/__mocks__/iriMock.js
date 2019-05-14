import IOTA from 'iota.lib.js';

const iota = new IOTA({ provider: 'foo://bar' });

export default (request) => {
    if (request.method() === 'OPTIONS') {
        return request.respond(
            request.respond({
                status: 200,
                contentType: 'text/plain',
                headers: {
                    'access-control-allow-headers': 'content-type,x-iota-api-version',
                    'access-control-allow-methods': 'GET, POST, OPTIONS',
                    'access-control-allow-origin': '*',
                },
            }),
        );
    }

    if (request.resourceType() !== 'xhr' || request.method() !== 'POST') {
        return request.continue();
    }

    const postData = JSON.parse(request.postData());

    let body = {};

    switch (postData.command) {
        case 'getNodeInfo':
            body = {
                appName: 'IRI',
                appVersion: '0.0.0-MOCK',
                latestMilestone: 'ABCDEFGHIJKLMNOPRSTUVXYZABCDEFGHIJKLMNOPRSTUVXYZABCDEFGHIJKLMNOPRSTUVXYZABCDEFGHI',
                latestMilestoneIndex: 426550,
                latestSolidSubtangleMilestone:
                    'ABCDEFGHIJKLMNOPRSTUVXYZABCDEFGHIJKLMNOPRSTUVXYZABCDEFGHIJKLMNOPRSTUVXYZABCDEFGHI',
                latestSolidSubtangleMilestoneIndex: 426550,
                time: Number(new Date()),
                features: ['RemotePOW'],
            };
            break;

        case 'wereAddressesSpentFrom':
            body = { states: Array(postData.addresses.length).fill(false) };
            break;

        case 'getBalances':
            body = { balances: Array(postData.addresses.length).fill(0) };
            break;

        case 'getTrytes': {
            const transactionObject = iota.utils.transactionObject('9'.repeat(2673));
            const trytes = iota.utils.transactionTrytes(
                Object.assign({}, transactionObject, { timestamp: Date.now() }),
            );
            body = { trytes: Array(postData.hashes.length).fill(trytes) };
            break;
        }
        case 'findTransactions':
            body = { trytes: Array(postData.addresses.length).fill('9'.repeat(81)) };
            break;
    }

    request.respond({
        status: 200,
        contentType: 'application/json',
        headers: {
            'access-control-allow-origin': '*',
        },
        body: JSON.stringify(body),
    });
};
