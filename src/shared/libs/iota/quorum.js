import { getValidNodes } from './multinode';
import { quorum_nodes } from '../../config';
import objectHash from 'object-hash';

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
