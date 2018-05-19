import objectHash from 'object-hash';
import sampleSize from 'lodash/sampleSize';
import { setApiTimeout, getValidNodes } from './multinode';
import { quorumNodes, quorumPoolSize, quorumThreshold, useLegacyQuorum } from '../../config';

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
            if (r.duration) {
                // some calls
                r.duration = 0;
            }
        }

        callback(undefined, getMostCommon(result, options.unorderedArrays || false, options.safeResult));
    });
}

export function getMostCommon(objs, unorderedArrays, safeResult) {
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

    if (maxseen / objs.length > quorumThreshold) {
        // passwed threshold
        return best;
    } else {
        // most common result but still less than threshold
        return safeResult === undefined ? best : safeResult(objs);
    }
}

export function getMostCommonElementwise(arrs, expectedlen, fallback) {
    // if somehow an array of wrong length got in here, get rid of it
    validarrs = [];
    for (arr of arrs) {
        if (arr.length == expectedlen) {
            validarrs.push(arr);
        }
    }

    ret = [];
    for (let i = 0; i < expectedlen; i++) {
        // get ith element of every array in piv
        piv = [];
        for (arr in validarrs) {
            piv.push(arr[i]);
        }

        // now find out which is most common, and that element
        ret.push(getMostCommon(piv, false, (o) => fallback));
    }

    return ret;
}
