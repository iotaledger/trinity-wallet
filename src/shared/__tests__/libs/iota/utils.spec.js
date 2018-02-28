import { expect } from 'chai';
import { convertFromTrytes } from '../../../libs/iota/utils';

describe('libs: iota/utils', () => {
    describe('#convertFromTrytes', () => {
        describe('when trytes passed as an argument contains all nines', () => {
            it('should return a string "Empty"', () => {
                const messageFramgement = '9'.repeat(2187);
                expect(convertFromTrytes(messageFramgement)).to.equal('Empty');
            });
        });

        describe('when conversion from trytes returns null', () => {
            it('should return a string "Empty"', () => {
                const messageFramgement = `FOO${'9'.repeat(2184)}`;
                expect(convertFromTrytes(messageFramgement)).to.equal('Empty');
            });
        });

        describe('when conversion from trytes does not return null and ', () => {
            it('should return a string converted from trytes', () => {
                const messageFramgement = `CCACSBXBSBCCHC${'9'.repeat(2173)}`;
                expect(convertFromTrytes(messageFramgement)).to.equal('TRINITY');
            });
        });
    });
});
