import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { FlatList } from 'react-native';
import PropTypes, { shape } from 'prop-types';
import { shallow } from 'enzyme';
import { Balance } from '../../containers/balance';

const getProps = overrides =>
    assign(
        {},
        {
            marketData: {},
            isSendingTransfer: false,
            isGeneratingReceiveAddress: false,
            isSyncing: false,
            seedIndex: 0,
            balance: 0,
            addresses: [],
            transfers: [],
            settings: {},
            setCurrency: noop,
            setTimeframe: noop,
            extraColor: 'white',
            negativeColor: 'white',
            secondaryBackgroundColor: 'white',
            chartLineColorPrimary: 'white',
            chartLineColorSecondary: 'white',
            t: noop,
            closeTopBar: noop,
        },
        overrides,
    );

describe('Testing Balance component', () => {
    describe('propTypes', () => {
        it('should require a marketData object as a prop', () => {
            expect(Balance.propTypes.marketData).toEqual(PropTypes.object.isRequired);
        });

        it('should require a isSendingTransfer boolean as a prop', () => {
            expect(Balance.propTypes.isSendingTransfer).toEqual(PropTypes.bool.isRequired);
        });

        it('should require an isGeneratingReceiveAddress boolean as a prop', () => {
            expect(Balance.propTypes.isGeneratingReceiveAddress).toEqual(PropTypes.bool.isRequired);
        });

        it('should require an isSyncing boolean as a prop', () => {
            expect(Balance.propTypes.isSyncing).toEqual(PropTypes.bool.isRequired);
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

        it('should require a chartLineColorPrimary string as a prop', () => {
            expect(Balance.propTypes.chartLineColorPrimary).toEqual(PropTypes.string.isRequired);
        });

        it('should require a chartLineColorSecondary string as a prop', () => {
            expect(Balance.propTypes.chartLineColorSecondary).toEqual(PropTypes.string.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(Balance.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a closeTopBar function as a prop', () => {
            expect(Balance.propTypes.closeTopBar).toEqual(PropTypes.func.isRequired);
        });

        it('should require a setCurrency function as a prop', () => {
            expect(Balance.propTypes.setCurrency).toEqual(PropTypes.func.isRequired);
        });

        it('should require a setTimeframe function as a prop', () => {
            expect(Balance.propTypes.setTimeframe).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Balance {...props} />);
            expect(wrapper.name()).toEqual('TouchableWithoutFeedback');
        });

        it('should return a Chart component', () => {
            const props = getProps();

            const wrapper = shallow(<Balance {...props} />);
            expect(wrapper.find('Chart').length).toEqual(1);
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
                    ].forEach(prop => expect(passedProps.includes(prop)).toEqual(true));
                });
            });
        });
    });
});
