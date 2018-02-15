import assign from 'lodash/assign';
import map from 'lodash/map';
import noop from 'lodash/noop';
import React from 'react';
import { FlatList } from 'react-native';
import PropTypes, { shape } from 'prop-types';
import { shallow } from 'enzyme';
import { Balance } from '../../containers/balance';

const getProps = (overrides) =>
    assign(
        {},
        {
            marketData: {},
            seedIndex: 0,
            balance: 0,
            addresses: [],
            transfers: [],
            settings: {},
            extraColor: 'white',
            negativeColor: 'white',
            secondaryBackgroundColor: 'white',
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
        },
        overrides,
    );

describe('Testing Balance component', () => {
    describe('propTypes', () => {
        it('should require a marketData object as a prop', () => {
            expect(Balance.propTypes.marketData).toEqual(PropTypes.object.isRequired);
        });

        it('should require an seedIndex number as a prop', () => {
            expect(Balance.propTypes.seedIndex).toEqual(PropTypes.number.isRequired);
        });

        it('should require a balance number as a prop', () => {
            expect(Balance.propTypes.balance).toEqual(PropTypes.number.isRequired);
        });

        it('should require an addresses array as a prop', () => {
            expect(Balance.propTypes.addresses).toEqual(PropTypes.array.isRequired);
        });

        it('should require a transfers array as a prop', () => {
            expect(Balance.propTypes.transfers).toEqual(PropTypes.array.isRequired);
        });

        it('should require a settings object as a prop', () => {
            expect(Balance.propTypes.settings).toEqual(PropTypes.object.isRequired);
        });

        it('should require a extraColor string as a prop', () => {
            expect(Balance.propTypes.extraColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a negativeColor string as a prop', () => {
            expect(Balance.propTypes.negativeColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a secondaryBackgroundColor string as a prop', () => {
            expect(Balance.propTypes.secondaryBackgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(Balance.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a closeTopBar function as a prop', () => {
            expect(Balance.propTypes.closeTopBar).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Balance {...props} />);
            expect(wrapper.name()).toEqual('TouchableWithoutFeedback');
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
                let transfers;

                beforeEach(() => {
                    transfers = [
                        [
                            {
                                currentIndex: 0,
                                lastIndex: 3,
                                timestamp: 1518327592290,
                                value: 1,
                                persistence: true,
                                address: 'U'.repeat(81),
                            },
                            {
                                currentIndex: 1,
                                lastIndex: 3,
                                timestamp: 1518327592290,
                                value: 1,
                                persistence: true,
                                address: 'A'.repeat(81),
                            },
                            {
                                currentIndex: 2,
                                lastIndex: 3,
                                timestamp: 1518327592290,
                                value: 1,
                                persistence: true,
                                address: 'B'.repeat(81),
                            },
                            {
                                currentIndex: 3,
                                lastIndex: 3,
                                timestamp: 1518327592290,
                                value: 1,
                                persistence: true,
                                address: 'C'.repeat(81),
                            },
                        ],
                    ];
                });

                it('should always return an array', () => {
                    const props = getProps();

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValue = instance.prepTransactions();

                    expect(Array.isArray(returnValue)).toEqual(true);
                });

                it('should have "time", "confirmationStatus", "value", "unit", "sign", "iconPath" and "style" props in each item in array', () => {
                    const props = getProps({ transfers });

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValueHead = instance.prepTransactions()[0];

                    ['time', 'confirmationStatus', 'value', 'unit', 'sign', 'iconPath', 'style'].forEach((prop) =>
                        expect(Object.keys(returnValueHead).includes(prop)).toEqual(true),
                    );

                    expect(Object.keys(returnValueHead).length).toEqual(7);
                });

                it('should have time prop equals timestamp prop in transfers object', () => {
                    const props = getProps({ transfers });

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValueHead = instance.prepTransactions()[0];

                    expect(returnValueHead.time).toEqual(1518327592290);
                });

                it('should have confirmationStatus prop equals "Received" if value prop is greater than one, addresses are part of transfers object and persistence is true', () => {
                    const props = getProps({
                        transfers,
                        addresses: ['U'.repeat(81), 'A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81)],
                    });

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValueHead = instance.prepTransactions()[0];

                    // Since addresses are part of transfers mock object and value > 0
                    expect(returnValueHead.confirmationStatus).toEqual('Received');
                });

                it('should have confirmationStatus prop equals "Receiving" if value prop is greater than one, addresses are part of transfers object and persistence is false', () => {
                    transfers = map(transfers, (tx) => map(tx, (t) => ({ ...t, persistence: false })));

                    const props = getProps({
                        transfers,
                        addresses: ['U'.repeat(81), 'A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81)],
                    });

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValueHead = instance.prepTransactions()[0];

                    expect(returnValueHead.confirmationStatus).toEqual('Receiving');
                });

                it('should have confirmationStatus prop equals "Sent" if value prop is less than one, addresses are part of transfers object and persistence is true', () => {
                    transfers = map(transfers, (tx) => map(tx, (t) => ({ ...t, value: -1 })));

                    const props = getProps({
                        transfers,
                        addresses: ['U'.repeat(81), 'A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81)],
                    });

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValueHead = instance.prepTransactions()[0];

                    expect(returnValueHead.confirmationStatus).toEqual('Sent');
                });

                it('should have confirmationStatus prop equals "Sending" if value prop is less than one, addresses are part of transfers object and persistence is false', () => {
                    transfers = map(transfers, (tx) => map(tx, (t) => ({ ...t, value: -1, persistence: false })));

                    const props = getProps({
                        transfers,
                        addresses: ['U'.repeat(81), 'A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81)],
                    });

                    const instance = shallow(<Balance {...props} />).instance();
                    const returnValueHead = instance.prepTransactions()[0];

                    expect(returnValueHead.confirmationStatus).toEqual('Sending');
                });
            });
        });
    });
});
