import assign from 'lodash/assign';
import noop from 'lodash/noop';
import each from 'lodash/each';
import React from 'react';
import { shallow } from 'enzyme';
import { Poll } from '../../containers/poll';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: () => Promise.resolve({}),
    getGenericPassword: () => Promise.resolve({}),
}));

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
            const argsMap = {
                allowed: {
                    marketData: { func: 'fetchMarketData', instance: false },
                    price: { func: 'fetchPrice', instance: false },
                    chartData: { func: 'fetchChartData', instance: false },
                    accountInfo: { func: 'fetchLatestAccountInfo', instance: true },
                    promotion: { func: 'promote', instance: true },
                },
                notAllowed: [null, undefined, 'dummy', 0],
            };

            each(argsMap.allowed, (value, arg) => {
                describe(`when argument is ${arg}`, () => {
                    it(`should call ${value.instance ? 'instance' : 'prop'} method ${value.func}`, () => {
                        let props = getProps();

                        if (!value.instance) {
                            props[value.func] = jest.fn();
                        }

                        const instance = shallow(<Poll {...props} />).instance();

                        if (value.instance) {
                            jest.spyOn(instance, value.func);
                        }

                        instance.fetch(arg);

                        const expected = value.instance ? instance[value.func] : props[value.func];

                        expect(expected).toHaveBeenCalledTimes(1);
                    });
                });
            });

            each(argsMap.notAllowed, (value, arg) => {
                describe(`when argument is ${arg}`, () => {
                    it('should call prop method setPollFor with first item in allPollingServices array', () => {
                        const props = getProps({
                            setPollFor: jest.fn(),
                        });

                        const instance = shallow(<Poll {...props} />).instance();

                        instance.fetch(arg);

                        expect(props.setPollFor).toHaveBeenCalledWith('foo'); // top item
                    });
                });
            });
        });
    });
});
