import { expect } from 'chai';
import { nodes } from '../../../config';
import { getRandomNode } from '../../../libs/iota';

describe('libs: iota/index', () => {
    describe('#getRandomNode', () => {
        it('should always return an element from nodes list passed as an argument', () => {
            const node = getRandomNode(nodes);
            expect(nodes).to.include(node);
        });
    });
});
