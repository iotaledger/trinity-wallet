import IOTA from 'iota.lib.js';

function checkNode(url, callback) {
    let iota = new IOTA({
        provider: url,
    });

    // shim the open function to add a timeout
    // TODO: implement timeout in iota.lib.js instead of here
    // if a call takes forever, it just sits in the background taking up space

    iota.api._makeRequest._open = iota.api._makeRequest.open;

    const conntimeout = 2000;

    iota.api._makeRequest.open = () => {
        let request = iota.api._makeRequest._open();

        // TODO: replace setTimeout with some native equivalent
        setTimeout(() => {
            if (request.readyState !== 4) {
                request.abort();
            }
        }, conntimeout);

        return request;
    };

    iota.api.getNodeInfo((err, nodeinfo) => {
        if (err) {
            callback(err);
            return;
        }

        if (
            nodeinfo.latestMilestoneIndex != nodeinfo.latestSolidSubtangleMilestoneIndex ||
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
            callback("Node doesn't have enough tips!");
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
    let promises = [];

    for (url of urls) {
        promises.push(
            new Promise((resolve, reject) => {
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

    Promise.all(promises).then(result => {
        // filter out all falsey values
        result = result.filter(Boolean);

        //        result.sort((a, b) => b[1].latestMilestoneIndex - a[1].latestMilestoneIndex);

        callback(result);
    });
}
