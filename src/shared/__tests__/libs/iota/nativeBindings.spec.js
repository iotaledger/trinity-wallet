import { expect } from 'chai';
import sinon from 'sinon';
import { overrideAsyncTransactionObject } from '../../../libs/iota/nativeBindings';

describe('libs: iota/nativeBindings', () => {
    describe('#overrideAsyncTransactionObject', () => {
        it('should assign "asyncTransactionObject" a function to object passed as first argument', () => {
            const object = {};
            overrideAsyncTransactionObject(object);

            expect(typeof object.asyncTransactionObject).to.equal('function');
        });

        describe('when getDigest is passed as second argument', () => {
            describe('when hash is not provided', () => {
                it('should call getDigest with trytes', () => {
                    const stub = sinon.stub();
                    stub.resolves('U'.repeat(81));

                    const instance = {};
                    overrideAsyncTransactionObject(instance, stub);

                    const trytes = '9'.repeat(2673);
                    return instance.asyncTransactionObject(trytes).then(() => {
                        expect(stub.calledWith(trytes)).to.equal(true);
                    });
                });

                it('should assign getDigest generated hash to transaction object', () => {
                    const stub = sinon.stub();
                    stub.resolves('U'.repeat(81));

                    const instance = {};
                    overrideAsyncTransactionObject(instance, stub);

                    const trytes = '9'.repeat(2673);
                    return instance.asyncTransactionObject(trytes).then((tx) => {
                        expect(tx.hash).to.equal('U'.repeat(81));
                    });
                });
            });

            describe('when hash is provided', () => {
                it('should not call getDigest with trytes', () => {
                    const stub = sinon.stub();
                    stub.resolves('U'.repeat(81));

                    const instance = {};
                    overrideAsyncTransactionObject(instance, stub);

                    const trytes = '9'.repeat(2673);
                    return instance.asyncTransactionObject(trytes, '9'.repeat(81)).then(() => {
                        expect(stub.calledWith(trytes)).to.equal(false);
                    });
                });
            });
        });
    });
});
