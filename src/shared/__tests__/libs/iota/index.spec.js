import { expect } from 'chai';
import { nodes } from '../../../config';
import { getRandomNode } from '../../../libs/iota';

describe('libs: iota/index', () => {
    describe('#getRandomNode', () => {
        it('should always return an element from config nodes list', () => {
            const node = getRandomNode();
            expect(nodes).to.include(node);
        });
    });
});
