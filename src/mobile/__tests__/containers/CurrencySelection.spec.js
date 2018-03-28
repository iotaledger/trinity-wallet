import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { CurrencySelection } from '../../containers/CurrencySelection';

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
            currency: 'foo',
            availableCurrencies: [],
            setSetting: noop,
            t: noop,
            theme: { body: {} },
            getCurrencyData: noop
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

        it('should require a bodyColor string as a prop', () => {
            expect(CurrencySelection.propTypes.bodyColor).toBe(PropTypes.string.isRequired);
        });

        it('should require a primaryColor object as a prop', () => {
            expect(CurrencySelection.propTypes.primaryColor).toBe(PropTypes.string.isRequired);
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
