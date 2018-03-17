import { setApiTimeout, clearApiTimeout } from './multinode';
import { quorum_nodes } from '../../config';
import objectHash from 'object-hash';

export function getQuorumResult(nodefunc, nodelist, timeout, unorderedArrays, callback) {
    let promises = [];

    for (nodeapi of nodelist) {
        promises.push(
            new Promise((resolve, reject) => {
                setApiTimeout(nodeapi, timeout);
                nodefunc(nodeapi, (err, res) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    clearApiTimeout(nodeapi);
                    resolve(res);
                });
            }),
        );
    }

    Promise.all(promises).then((result) => {
        // filter out all falsey values
        result = result.filter(Boolean);

        for (r of result) {
            r.duration = 0;
        }

        callback(getMostCommon(result, unorderedArrays));
    });
}

export function getMostCommon(objs, unorderedArrays) {
    /*
      Returns the most commonly seen object in array.
    */
    let best = null;
    let maxseen = 0;
    let seentimes = new Map();

    unorderedArrays = unorderedArrays || false;

    for (let ob of objs) {
        let rhash = objectHash(ob, {
            unorderedArrays: unorderedArrays,
        });
        let cnt = seentimes.get(rhash);
        if (!cnt) {
            cnt = 0;
        }

        // set new count
        cnt++;
        seentimes.set(rhash, cnt);
        if (cnt > maxseen) {
            maxseen = cnt;
            best = ob;
        }
    }

    return best;
}
