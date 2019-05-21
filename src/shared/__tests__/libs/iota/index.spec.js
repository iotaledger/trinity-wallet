import { expect } from 'chai';
import { DEFAULT_NODES } from '../../../config';
import { getRandomNode } from '../../../libs/iota';

describe('libs: iota/index', () => {
    describe('#getRandomNode', () => {
        it('should always return an element from nodes list passed as an argument', () => {
            const node = getRandomNode(DEFAULT_NODES);
            expect(DEFAULT_NODES).to.include(node);
        });
    });
});
