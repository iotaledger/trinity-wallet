import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { CurrencySelection } from '../../containers/CurrencySelection';

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
            isFetchingCurrencyData: true,
            currency: 'foo',
            availableCurrencies: [],
            setSetting: noop,
            t: noop,
            theme: { body: {}, primary: {} },
            getCurrencyData: noop,
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

        it('should require a availableCurrencies array as a prop', () => {
            expect(CurrencySelection.propTypes.availableCurrencies).toBe(PropTypes.array.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(CurrencySelection.propTypes.t).toBe(PropTypes.func.isRequired);
        });

        it('should require a setSetting function as a prop', () => {
            expect(CurrencySelection.propTypes.setSetting).toBe(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(CurrencySelection.propTypes.theme).toBe(PropTypes.object.isRequired);
        });
    });

    describe('#componentWillReceiveProps', () => {
        describe('when isFetchingCurrencyData is true', () => {
            it('should not call prop method setSetting when isFetchingCurrencyData is true in the newProps', () => {
                const props = getProps({
                    setSetting: jest.fn(),
                });

                const wrapper = shallow(<CurrencySelection {...props} />);

                wrapper.setProps({
                    isFetchingCurrencyData: true,
                });

                expect(props.setSetting).toHaveBeenCalledTimes(0);
            });

            it('should not call prop method setSetting when isFetchingCurrencyData is false in the newProps but hasErrorFetchingCurrencyData is true', () => {
                const props = getProps({
                    setSetting: jest.fn(),
                });

                const wrapper = shallow(<CurrencySelection {...props} />);
                wrapper.setProps({
                    isFetchingCurrencyData: false,
                    hasErrorFetchingCurrencyData: true,
                });

                expect(props.setSetting).toHaveBeenCalledTimes(0);
            });

            it('should call prop method setSetting when isFetchingCurrencyData and hasErrorFetchingCurrencyData are false in the newProps', () => {
                const props = getProps({
                    setSetting: jest.fn(),
                });

                const wrapper = shallow(<CurrencySelection {...props} />);
                wrapper.setProps({
                    isFetchingCurrencyData: false,
                    hasErrorFetchingCurrencyData: false,
                });

                expect(props.setSetting).toHaveBeenCalledTimes(1);
            });
        });
    });
});
