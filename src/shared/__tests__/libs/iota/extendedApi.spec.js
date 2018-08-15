import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import { expect } from 'chai';
import sinon from 'sinon';
import { getIotaInstance, isNodeSynced } from '../../../libs/iota/extendedApi';
import { iota, SwitchingConfig } from '../../../libs/iota/index';
import trytes from '../../__samples__/trytes';
import { EMPTY_HASH_TRYTES } from '../../../libs/iota/utils';

describe('libs: iota/extendedApi', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#getIotaInstance', () => {
        describe('when "provider" is passed as an argument', () => {
            it('should not return global iota instance', () => {
                const instance = getIotaInstance('provider');
                expect(isEqual(instance, iota)).to.equal(false);
            });
        });

        describe('when "provider" is not passed as an argument', () => {
            it('should return global iota instance', () => {
                const instance = getIotaInstance();
                expect(isEqual(instance, iota)).to.equal(true);
            });
        });
    });

    describe('#isNodeSynced', () => {
        let sandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when latestMilestone is not equal to latestSolidSubtangleMilestone', () => {
            beforeEach(() => {
                sandbox.stub(iota.api, 'getNodeInfo').yields(null, {
                    latestMilestone: EMPTY_HASH_TRYTES,
                    latestSolidSubtangleMilestone: 'U'.repeat(81),
                });
            });

            it('should throw with an error "Node not synced"', () => {
                return isNodeSynced().catch((error) => expect(error.message).to.equal('Node not synced'));
            });
        });

        describe(`when latestMilestone is ${EMPTY_HASH_TRYTES}`, () => {
            beforeEach(() => {
                sandbox.stub(iota.api, 'getNodeInfo').yields(null, {
                    latestMilestone: EMPTY_HASH_TRYTES,
                    latestSolidSubtangleMilestone: EMPTY_HASH_TRYTES,
                });
            });

            it('should throw with an error "Node not synced"', () => {
                return isNodeSynced().catch((error) => expect(error.message).to.equal('Node not synced'));
            });
        });

        describe('when latestSolidSubtangleMilestoneIndex is 1 less than latestMilestoneIndex', () => {
            beforeEach(() => {
                sandbox.stub(iota.api, 'getNodeInfo').yields(null, {
                    latestMilestoneIndex: 426550,
                    latestSolidSubtangleMilestoneIndex: 426550 - 1,
                    latestMilestone: 'U'.repeat(81),
                    latestSolidSubtangleMilestone: 'A'.repeat(81),
                });
            });

            it('should return false if "timestamp" on trytes is from five minutes ago', () => {
                const getTrytes = sinon.stub(iota.api, 'getTrytes').yields(null, trytes.zeroValue);

                return isNodeSynced().then((result) => {
                    expect(result).to.equal(false);
                    getTrytes.restore();
                });
            });

            it('should return true if "timestamp" on trytes is within five minutes', () => {
                const trytesWithOldTimestamp = trytes.zeroValue;
                const trytesWithLatestTimestamp = map(trytesWithOldTimestamp, (tryteString) => {
                    const transactionObject = iota.utils.transactionObject(tryteString);
                    const timestampLessThanAMinuteAgo = Date.now() - 60000;

                    return iota.utils.transactionTrytes({
                        ...transactionObject,
                        timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
                    });
                });

                const getTrytes = sinon.stub(iota.api, 'getTrytes').yields(null, trytesWithLatestTimestamp);

                return isNodeSynced().then((result) => {
                    expect(result).to.equal(true);
                    getTrytes.restore();
                });
            });
        });

        describe(`when latestMilestone is not ${EMPTY_HASH_TRYTES} and is equal to latestSolidSubtangleMilestone`, () => {
            beforeEach(() => {
                sandbox.stub(iota.api, 'getNodeInfo').yields(null, {
                    latestMilestone: 'U'.repeat(81),
                    latestSolidSubtangleMilestone: 'U'.repeat(81),
                });
            });

            it('should return false if "timestamp" on trytes is from five minutes ago', () => {
                const getTrytes = sinon.stub(iota.api, 'getTrytes').yields(null, trytes.zeroValue);

                return isNodeSynced().then((result) => {
                    expect(result).to.equal(false);
                    getTrytes.restore();
                });
            });

            it('should return true if "timestamp" on trytes is within five minutes', () => {
                const trytesWithOldTimestamp = trytes.zeroValue;
                const trytesWithLatestTimestamp = map(trytesWithOldTimestamp, (tryteString) => {
                    const transactionObject = iota.utils.transactionObject(tryteString);
                    const timestampLessThanAMinuteAgo = Date.now() - 60000;

                    return iota.utils.transactionTrytes({
                        ...transactionObject,
                        timestamp: Math.round(timestampLessThanAMinuteAgo / 1000),
                    });
                });

                const getTrytes = sinon.stub(iota.api, 'getTrytes').yields(null, trytesWithLatestTimestamp);

                return isNodeSynced().then((result) => {
                    expect(result).to.equal(true);
                    getTrytes.restore();
                });
            });
        });
    });
});
