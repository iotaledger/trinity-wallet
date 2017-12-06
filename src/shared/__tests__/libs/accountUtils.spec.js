import { expect } from 'chai';
import { getAddressesWithChangedBalance } from '../../libs/accountUtils';

describe('libs: accountUtils', () => {
    describe('#getAddressesWithChangedBalance', () => {
        describe('when second argument array indices do not match indices of items in first argument array', () => {
            it('should return an empty array', () => {
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [3, 4])).to.eql([]);
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [])).to.eql([]);
            });
        });

        describe('when second argument array indices match indices of items in first argument array', () => {
            it('should return an array with items from first argument array', () => {
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [0])).to.eql(['foo']);
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [0, 1])).to.eql(['foo', 'baz']);
                expect(getAddressesWithChangedBalance(['foo', 'baz'], [1])).to.eql(['baz']);
            });
        });
    });
});
