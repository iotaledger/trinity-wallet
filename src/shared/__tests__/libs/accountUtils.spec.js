import { expect } from 'chai';
import { getAddressesWithChangedBalance } from '../../libs/accountUtils';

describe('libs: accountUtils', () => {
    describe('#getAddressesWithChangedBalance', () => {
        describe('when second argument array indices do not match items in first argument array', () => {
            it('should return an empty array', () => {
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [3, 4])).to.eql([]);
            });
        });
    });
});
