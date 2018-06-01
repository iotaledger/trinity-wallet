import map from 'lodash/map';
import { expect } from 'chai';
import sinon from 'sinon';
import { isNodeSynced } from '../../../libs/iota/extendedApi';
import { iota, SwitchingConfig } from '../../../libs/iota/index';
import trytes from '../../__samples__/trytes';

describe('libs: iota/extendedApi', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
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
                    latestMilestone: '9'.repeat(81),
                    latestSolidSubtangleMilestone: 'U'.repeat(81),
                });
            });

            it('should throw with an error "Node not synced"', () => {
                return isNodeSynced().catch((error) => expect(error.message).to.equal('Node not synced'));
            });
        });

        describe(`when latestMilestone is ${'9'.repeat(81)}`, () => {
            beforeEach(() => {
                sandbox.stub(iota.api, 'getNodeInfo').yields(null, {
                    latestMilestone: '9'.repeat(81),
                    latestSolidSubtangleMilestone: '9'.repeat(81),
                });
            });

            it('should throw with an error "Node not synced"', () => {
                return isNodeSynced().catch((error) => expect(error.message).to.equal('Node not synced'));
            });
        });

        describe(`when latestMilestone is not ${'9'.repeat(81)} and is equal to latestSolidSubtangleMilestone`, () => {
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
