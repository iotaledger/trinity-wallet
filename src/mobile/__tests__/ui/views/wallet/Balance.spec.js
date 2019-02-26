import assign from 'lodash/assign';
import find from 'lodash/find';
import noop from 'lodash/noop';
import React from 'react';
import { FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { Balance } from 'ui/views/wallet/Balance';
import theme from '../../../../__mocks__/theme';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            usdPrice: 1,
            seedIndex: 0,
            balance: 0,
            addresses: [],
            transactions: {},
            theme,
            t: (arg) => {
                const translations = {
                    received: 'Received',
                    receiving: 'Receiving',
                    sent: 'Sent',
                    sending: 'Sending',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
            closeTopBar: noop,
            onTabSwitch: noop,
            currency: 'USD',
            conversionRate: 1,
            isRefreshing: false,
            onRefresh: noop,
            animateChartOnMount: true,
            setAnimateChartOnMount: noop,
        },
        overrides,
    );

describe('Testing Balance component', () => {
    describe('propTypes', () => {
        it('should require a seedIndex number as a prop', () => {
            expect(Balance.propTypes.seedIndex).toEqual(PropTypes.number.isRequired);
        });

        it('should require a balance number as a prop', () => {
            expect(Balance.propTypes.balance).toEqual(PropTypes.number.isRequired);
        });

        it('should require a transactions object as a prop', () => {
            expect(Balance.propTypes.transactions).toEqual(PropTypes.object.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(Balance.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a closeTopBar function as a prop', () => {
            expect(Balance.propTypes.closeTopBar).toEqual(PropTypes.func.isRequired);
        });

        it('should require a onTabSwitch function as a prop', () => {
            expect(Balance.propTypes.onTabSwitch).toEqual(PropTypes.func.isRequired);
        });

        it('should require an isRefreshing boolean as a prop', () => {
            expect(Balance.propTypes.isRefreshing).toEqual(PropTypes.bool.isRequired);
        });

        it('should require an onRefresh function as a prop', () => {
            expect(Balance.propTypes.onRefresh).toEqual(PropTypes.func.isRequired);
        });

        it('should require an setAnimateChartOnMount function as a prop', () => {
            expect(Balance.propTypes.setAnimateChartOnMount).toEqual(PropTypes.func.isRequired);
        });

        it('should require an animateChartOnMount bool as a prop', () => {
            expect(Balance.propTypes.animateChartOnMount).toEqual(PropTypes.bool.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Balance {...props} />);
            expect(wrapper.name()).toEqual('ScrollView');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#renderTransactions', () => {
                it('should return a FlatList component', () => {
                    const props = getProps();

                    const instance = shallow(<Balance {...props} />).instance();
                    const element = instance.renderTransactions();

                    expect(element.type).toEqual(FlatList);
                });

                it('should pass a scrollEnabled prop equal to false to returned component', () => {
                    const props = getProps();

                    const instance = shallow(<Balance {...props} />).instance();
                    const element = instance.renderTransactions();

                    expect(element.props.scrollEnabled).toEqual(false);
                });

                it('should pass "data", "keyExtractor", "renderItem", "contentContainerStyle", "ItemSeparatprComponent" and "ListEmptyComponent" props to returned component', () => {
                    const props = getProps();

                    const instance = shallow(<Balance {...props} />).instance();
                    const element = instance.renderTransactions();

                    const passedProps = Object.keys(element.props);

                    [
                        'data',
                        'keyExtractor',
                        'renderItem',
                        'contentContainerStyle',
                        'ItemSeparatorComponent',
                        'ListEmptyComponent',
                    ].forEach((prop) => expect(passedProps.includes(prop)).toEqual(true));
                });
            });

            describe('#prepTransactions', () => {
                let transactions;

                beforeEach(() => {
                    transactions = {
                        bundleHashOne: {
                            value: -100,
                            persistence: true,
                            transferValue: -100,
                            incoming: false,
                            inputs: [{ address: 'U'.repeat(81), value: -100 }],
                            outputs: [{ address: 'A'.repeat(81), value: 100 }],
                        },
                        bundleHashTwo: {
                            value: 80,
                            persistence: true,
                            transferValue: 80,
                            incoming: true,
                            inputs: [{ address: 'E'.repeat(81), value: -80 }],
                            outputs: [{ address: 'B'.repeat(81), value: 80 }],
                        },
                    };
                });

                it('should always return an array', () => {
                    const props = getProps();

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValue = instance.prepTransactions();

                    expect(Array.isArray(returnValue)).toEqual(true);
                });

                it('should have "time", "icon", "confirmationStatus", "value", "unit", "sign", and "style" props in each item in array', () => {
                    const props = getProps({ transactions });

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValueHead = instance.prepTransactions()[0];

                    ['time', 'confirmationStatus', 'value', 'unit', 'sign', 'style', 'icon'].forEach((prop) =>
                        expect(Object.keys(returnValueHead).includes(prop)).toEqual(true),
                    );

                    expect(Object.keys(returnValueHead).length).toEqual(8);
                });

                it('should have confirmationStatus prop equals "Received" if the transfer is incoming and persistence is true', () => {
                    const props = getProps({ transactions });

                    const instance = shallow(<Balance {...props} />).instance();
                    const incomingTransaction = find(instance.prepTransactions(), { incoming: true });

                    expect(incomingTransaction.confirmationStatus).toEqual('Received');
                });

                it('should have confirmationStatus prop equals "Receiving" if the transfer is incoming and persistence is false', () => {
                    const props = getProps({
                        transactions: assign({}, transactions, {
                            bundleHashTwo: {
                                value: 0,
                                persistence: false,
                                transferValue: 0,
                                incoming: true,
                                inputs: [],
                                outputs: [{ address: 'U'.repeat(81), value: 0 }],
                            },
                        }),
                    });

                    const instance = shallow(<Balance {...props} />).instance();
                    const incomingTransaction = find(instance.prepTransactions(), { incoming: true });

                    expect(incomingTransaction.confirmationStatus).toEqual('Receiving');
                });

                it('should have confirmationStatus prop equals "Sent" if the transfer is not incoming and persistence is true', () => {
                    const props = getProps({ transactions });

                    const instance = shallow(<Balance {...props} />).instance();
                    const outgoingTransaction = find(instance.prepTransactions(), { incoming: false });

                    expect(outgoingTransaction.confirmationStatus).toEqual('Sent');
                });

                it('should have confirmationStatus prop equals "Sending" if the transfer is not incoming and persistence is false', () => {
                    const props = getProps({
                        transactions: assign({}, transactions, {
                            bundleHashOne: {
                                value: -10,
                                persistence: false,
                                transferValue: 80,
                                incoming: false,
                                inputs: [{ address: 'Y'.repeat(81), value: -10 }],
                                outputs: [{ address: 'U'.repeat(81), value: 80 }],
                            },
                        }),
                    });

                    const instance = shallow(<Balance {...props} />).instance();
                    const outgoingTransaction = find(instance.prepTransactions(), { incoming: false });

                    expect(outgoingTransaction.confirmationStatus).toEqual('Sending');
                });
            });
        });
    });
});
