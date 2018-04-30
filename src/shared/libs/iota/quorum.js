import objectHash from 'object-hash';
import sampleSize from 'lodash/sampleSize';
import { setApiTimeout, getValidNodes } from './multinode';
import { quorumNodes, quorumPoolSize, useLegacyQuorum } from '../../config';

let validQuorumNodes = [];

export function getQuorumNodes() {
    return sampleSize(validQuorumNodes, quorumPoolSize);
}

function pollNodes() {
    if (useLegacyQuorum) {
        getValidNodes(quorumNodes, (res) => {
            validQuorumNodes = res;
        });
    }
}

pollNodes();

export function getQuorumResult(nodefunc, options, callback) {
    const promises = [];
    options = options || {};

    for (const nodeapi of options.nodelist || getQuorumNodes()) {
        promises.push(
            // eslint-disable-next-line no-unused-vars
            new Promise((resolve, reject) => {
                setApiTimeout(nodeapi, options.timeout || 1000);
                nodefunc(nodeapi, (err, res) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    //                    clearApiTimeout(nodeapi);
                    resolve(res);
                });
            }),
        );
    }

    Promise.all(promises).then((result) => {
        // filter out all falsey values
        result = result.filter(Boolean);

        for (const r of result) {
            r.duration = 0;
        }

        callback(undefined, getMostCommon(result, options.unorderedArrays || false));
    });
}

export function getMostCommon(objs, unorderedArrays) {
    /*
      Returns the most commonly seen object in array.
    */
    let best = null;
    let maxseen = 0;
    const seentimes = new Map();

    unorderedArrays = unorderedArrays || false;

    for (const ob of objs) {
        const rhash = objectHash(ob, {
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
