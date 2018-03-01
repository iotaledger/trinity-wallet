import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { CurrencySelection } from '../../components/currencySelection';

/* eslint-disable no-undef */

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            isFetchingCurrencyData: true,
            hasErrorFetchingCurrencyData: false,
            getCurrencyData: noop,
            currency: 'foo',
            currencies: ['foo', 'baz'],
            backPress: noop,
            t: noop,
            secondaryBackgroundColor: 'white',
            negativeColor: 'white',
            tickImagePath: 0,
            arrowLeftImagePath: 0,
        },
        overrides,
    );

describe('Testing CurrencySelection component', () => {
    describe('propTypes', () => {
        it('should require an isFetchingCurrencyData boolean as a prop', () => {
            expect(CurrencySelection.propTypes.isFetchingCurrencyData).toBe(PropTypes.bool.isRequired);
        });

        it('should require a getCurrencyData function as a prop', () => {
            expect(CurrencySelection.propTypes.getCurrencyData).toBe(PropTypes.func.isRequired);
        });

        it('should require a currency string as a prop', () => {
            expect(CurrencySelection.propTypes.currency).toBe(PropTypes.string.isRequired);
        });

        it('should require a currencies array as a prop', () => {
            expect(CurrencySelection.propTypes.currencies).toBe(PropTypes.array.isRequired);
        });

        it('should require a backPress function as a prop', () => {
            expect(CurrencySelection.propTypes.backPress).toBe(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(CurrencySelection.propTypes.t).toBe(PropTypes.func.isRequired);
        });

        it('should require a secondaryBackgroundColor string as a prop', () => {
            expect(CurrencySelection.propTypes.secondaryBackgroundColor).toBe(PropTypes.string.isRequired);
        });

        it('should require a negativeColor object as a prop', () => {
            expect(CurrencySelection.propTypes.negativeColor).toBe(PropTypes.string.isRequired);
        });

        it('should require a tickImagePath number as a prop', () => {
            expect(CurrencySelection.propTypes.tickImagePath).toBe(PropTypes.number.isRequired);
        });

        it('should require a arrowLeftImagePath number as a prop', () => {
            expect(CurrencySelection.propTypes.arrowLeftImagePath).toBe(PropTypes.number.isRequired);
        });
    });

    describe('#componentWillReceiveProps', () => {
        describe('when isFetchingCurrencyData is true', () => {
            it('should not call prop method backPress when isFetchingCurrencyData is true in the newProps', () => {
                const props = getProps({
                    backPress: jest.fn(),
                });

                const wrapper = shallow(<CurrencySelection {...props} />);

                wrapper.setProps({
                    isFetchingCurrencyData: true,
                });

                expect(props.backPress).toHaveBeenCalledTimes(0);
            });

            it('should not call prop method backPress when isFetchingCurrencyData is false in the newProps but hasErrorFetchingCurrencyData is true', () => {
                const props = getProps({
                    backPress: jest.fn(),
                });

                const wrapper = shallow(<CurrencySelection {...props} />);
                wrapper.setProps({
                    isFetchingCurrencyData: false,
                    hasErrorFetchingCurrencyData: true,
                });

                expect(props.backPress).toHaveBeenCalledTimes(0);
            });

            it('should call prop method backPress when isFetchingCurrencyData and hasErrorFetchingCurrencyData are false in the newProps', () => {
                const props = getProps({
                    backPress: jest.fn(),
                });

                const wrapper = shallow(<CurrencySelection {...props} />);
                wrapper.setProps({
                    isFetchingCurrencyData: false,
                    hasErrorFetchingCurrencyData: false,
                });

                expect(props.backPress).toHaveBeenCalledTimes(1);
            });
        });
    });
});
