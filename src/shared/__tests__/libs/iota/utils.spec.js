import sinon from 'sinon';
import { expect } from 'chai';
import { convertFromTrytes, withRetriesOnDifferentNodes } from '../../../libs/iota/utils';

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
                // fromTrytes would return null if the message length is odd
                // https://github.com/iotaledger/iota.lib.js/blob/master/lib/utils/asciiToTrytes.js#L74
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

    describe('#withRetriesOnDifferentNodes', () => {
        it('should return a function', () => {
            const returnValue = withRetriesOnDifferentNodes([]);
            expect(typeof returnValue).to.equal('function');
        });

        it('should throw if no promise gets resolved during retry', () => {
            const retryAttempts = 3;

            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).rejects();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes([], retryAttempts);

            return result(stub)().catch(() => {
                expect(stub.calledThrice).to.equal(true);
            });
        });

        it('should not throw if any promise gets resolved during retry', () => {
            const retryAttempts = 3;

            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).resolves();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes([], retryAttempts);

            return result(stub)().then(() => {
                expect(stub.calledTwice).to.equal(true);
            });
        });
    });
});
