import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { Poll } from '../../containers/poll';
import PropTypes from 'prop-types';

const getProps = overrides =>
    assign(
        {},
        {
            pollFor: 'foo',
            allPollingServices: ['foo', 'baz'],
            isFetchingPrice: false,
            isFetchingChartData: false,
            isFetchingMarketData: false,
            isFetchingAccountInfo: false,
            isPromoting: false,
            isSyncing: false,
            addingAdditionalAccount: false,
            isSendingTransfer: false,
            isGeneratingReceiveAddress: false,
            isFetchingLatestAccountInfoOnLogin: false,
            seedIndex: 0,
            selectedAccountName: 'foo account',
            unconfirmedBundleTails: {},
            setPollFor: noop,
            fetchMarketData: noop,
            fetchPrice: noop,
            fetchChartData: noop,
            getAccountInfo: noop,
            promoteTransfer: noop,
            removeBundleFromUnconfirmedBundleTails: noop,
        },
        overrides,
    );

describe('Testing Poll component', () => {
    describe('when renders', () => {
        it('should return null', () => {
            const props = getProps();

            const wrapper = shallow(<Poll {...props} />);
            expect(wrapper.type()).toEqual(null);
        });
    });

    describe('static methods', () => {
        describe('#shouldPromote', () => {
            let now;

            beforeEach(() => {
                now = new Date();
            });
            it('should return true if attachmentTimestamp prop in argument is less than a day older', () => {
                expect(Poll.shouldPromote({ attachmentTimestamp: now })).toEqual(true);
                expect(Poll.shouldPromote({ attachmentTimestamp: now.setHours(now.getHours() - 10) })).toEqual(true);
            });

            it('should return false if attachmentTimestamp prop in argument is not less than a day older', () => {
                expect(Poll.shouldPromote({ attachmentTimestamp: now.setHours(now.getHours() - 48) })).toEqual(false);
                expect(Poll.shouldPromote({ attachmentTimestamp: now.setHours(now.getHours() - 25) })).toEqual(false);
            });
        });
    });

    describe('lifecycle methods', () => {
        describe('#componentDidMount', () => {
            afterEach(() => {
                if (Poll.prototype.startBackgroundProcesses.mockClear) {
                    Poll.prototype.startBackgroundProcesses.mockClear();
                }
            });

            it('should call instance method startBackgroundProcesses', () => {
                const props = getProps();

                jest.spyOn(Poll.prototype, 'startBackgroundProcesses');

                const instance = shallow(<Poll {...props} />, { lifecycleExperimental: true }).instance();

                expect(instance.startBackgroundProcesses).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('instance methods', () => {
        describe('#fetch', () => {
            describe('when argument is "marketData"', () => {
                it('should call prop method fetchMarketData', () => {
                    const props = getProps({
                        fetchMarketData: jest.fn(),
                    });

                    const instance = shallow(<Poll {...props} />, { lifecycleExperimental: true }).instance();

                    instance.fetch('marketData');
                    expect(props.fetchMarketData).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
