import objectHash from 'object-hash';
import sampleSize from 'lodash/sampleSize';
import { setApiTimeout, getValidNodes } from './multinode';
import { quorumNodes, quorumPoolSize } from '../../config';

let validQuorumNodes = [];

export function getQuorumNodes() {
    return sampleSize(validQuorumNodes, quorumPoolSize);
}

function pollNodes() {
    getValidNodes(quorumNodes, (res) => {
        validQuorumNodes = res;
        console.log('valid quorum nodes: ', res.length);
    });
}

pollNodes();

export function getQuorumResult(nodefunc, timeout, unorderedArrays, callback) {
    const promises = [];

    for (const nodeapi of getQuorumNodes()) {
        promises.push(
            // eslint-disable-next-line no-unused-vars
            new Promise((resolve, reject) => {
                setApiTimeout(nodeapi, timeout);
                nodefunc(nodeapi, (err, res) => {
                    console.log('nodeaptgqrres', err, res);
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

        callback(undefined, getMostCommon(result, unorderedArrays));
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

    console.log('quorum agreement of', maxseen, 'nodes');

    return best;
}
