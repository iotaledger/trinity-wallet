import IOTA from 'iota.lib.js';

import { NODE_REQUEST_TIMEOUT } from '../config';

function checkNode(url, callback) {
    const iota = new IOTA({
        provider: url,
    });

    iota.api.setApiTimeout(NODE_REQUEST_TIMEOUT);

    iota.api.getNodeInfo((err, nodeinfo) => {
        if (err) {
            callback(err);
            return;
        }

        if (
            nodeinfo.latestMilestoneIndex !== nodeinfo.latestSolidSubtangleMilestoneIndex ||
            nodeinfo.latestMilestone ===
                '999999999999999999999999999999999999999999999999999999999999999999999999999999999'
        ) {
            callback('Node is not synced!');
            return;
        }

        const tipThreshold = 100;
        const txsToRequestThreshold = 200;
        const neighborsThreshold = 2;

        if (nodeinfo.tips < tipThreshold) {
            callback('Node doesn\'t have enough tips!');
        }

        if (nodeinfo.transactionsToRequest > txsToRequestThreshold) {
            callback('Node txsToRequest too high!');
        }

        if (nodeinfo.neighbors < neighborsThreshold) {
            callback('Node has too few neighbors!');
        }

        // TODO: Somehow figure out if node is latest version

        // unshim _makeRequest before returning
        iota.api._makeRequest.open = iota.api._makeRequest._open;
        callback(undefined, iota, nodeinfo);
    });
}

export function getValidNodes(urls, callback) {
    const promises = [];

    for (const url of urls) {
        promises.push(
            new Promise((resolve) => {
                checkNode(url, (err, iota, nodeinfo) => {
                    if (err) {
                        resolve(undefined);
                    } else {
                        resolve([iota, nodeinfo]);
                    }
                });
            }),
        );
    }

    Promise.all(promises).then((result) => {
        // filter out all falsey values
        result = result.filter(Boolean);

        //        result.sort((a, b) => b[1].latestMilestoneIndex - a[1].latestMilestoneIndex);

        callback(result);
    });
}
