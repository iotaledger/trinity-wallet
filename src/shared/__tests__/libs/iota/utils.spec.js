import map from 'lodash/map';
import sinon from 'sinon';
import { expect } from 'chai';
import { convertFromTrytes, getRandomNodes, withRetriesOnDifferentNodes } from '../../../libs/iota/utils';

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
            const returnValue = withRetriesOnDifferentNodes(['provider']);
            expect(typeof returnValue).to.equal('function');
        });

        it('should throw an error "No nodes to retry on if no nodes are provided"', () => {
            const result = withRetriesOnDifferentNodes([]);

            return result(() => Promise.resolve())('foo').catch((err) => {
                expect(err.message).to.equal('No node to retry.');
            });
        });

        it('should throw if no promise gets resolved during retry', () => {
            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).rejects();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes(
                Array(3)
                    .fill()
                    .map((_, index) => index),
            );

            return result(() => stub)('foo').catch(() => {
                expect(stub.calledThrice).to.equal(true);
            });
        });

        it('should not throw if any promise gets resolved during retry', () => {
            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).resolves();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes(
                Array(3)
                    .fill()
                    .map((_, index) => index),
            );

            return result(() => stub)('foo').then(() => {
                expect(stub.calledTwice).to.equal(true);
            });
        });

        it('should trigger callback on each failure if callback is passed as an array of functions', () => {
            const stub = sinon.stub();

            const nodes = Array(3)
                .fill()
                .map((_, index) => index);
            const result = withRetriesOnDifferentNodes(nodes, map(nodes, () => stub));

            return result(() => () => Promise.reject())('foo').catch(() => {
                expect(stub.calledThrice).to.equal(true);
            });
        });

        it('should trigger callback once if callback is passed as a function', () => {
            const stub = sinon.stub();

            const nodes = Array(3)
                .fill()
                .map((_, index) => index);
            const result = withRetriesOnDifferentNodes(nodes, stub);

            return result(() => () => Promise.reject())('foo').catch(() => {
                expect(stub.calledOnce).to.equal(true);
            });
        });
    });

    describe('#getRandomNodes', () => {
        let nodes;
        let size;
        before(() => {
            nodes = Array(6)
                .fill()
                .map((_, index) => index);
            size = 3;
        });

        it('should not choose blacklisted nodes', () => {
            const blacklisted = [3, 5];
            const result = getRandomNodes(nodes, size, blacklisted);

            expect(result).to.not.include([3, 5]);
        });
    });
});
