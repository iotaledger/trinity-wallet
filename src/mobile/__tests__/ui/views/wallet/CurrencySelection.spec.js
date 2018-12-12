import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { CurrencySelection } from 'ui/views/wallet/CurrencySelection';
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
            isFetchingCurrencyData: true,
            currency: 'foo',
            qrDenomination: 'i',
            sendDenomination: 'i',
            availableCurrencies: [],
            setSetting: noop,
            t: noop,
            theme,
            getCurrencyData: noop,
            setQrDenomination: noop,
            setSendDenomination: noop,
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

        it('should require a sendDenomination string as a prop', () => {
            expect(CurrencySelection.propTypes.sendDenomination).toBe(PropTypes.string.isRequired);
        });

        it('should require a qrDenomination string as a prop', () => {
            expect(CurrencySelection.propTypes.qrDenomination).toBe(PropTypes.string.isRequired);
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
        describe('when isFetchingCurrencyData prop is true', () => {
            describe('when isFetchingCurrencyData is true in newProps', () => {
                it('should not call prop method "setSetting"', () => {
                    const props = getProps({
                        setSetting: jest.fn(),
                    });

                    const wrapper = shallow(<CurrencySelection {...props} />);

                    wrapper.setProps({
                        isFetchingCurrencyData: true,
                    });

                    expect(props.setSetting).toHaveBeenCalledTimes(0);
                });
            });

            describe('when isFetchingCurrencyData is false in newProps and hasErrorFetchingCurrencyData is true in newProps', () => {
                it('should not call prop method "setSetting"', () => {
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
            });

            describe('when isFetchingCurrencyData is false in newProps and hasErrorFetchingCurrencyData is true in newProps', () => {
                it('should call prop method "setSetting" with "mainSettings"', () => {
                    const props = getProps({
                        setSetting: jest.fn(),
                    });

                    const wrapper = shallow(<CurrencySelection {...props} />);
                    wrapper.setProps({
                        isFetchingCurrencyData: false,
                        hasErrorFetchingCurrencyData: false,
                    });

                    expect(props.setSetting).toHaveBeenCalledWith('mainSettings');
                });

                describe('when "qrDenomination" prop value is included in allowed IOTA denominations', () => {
                    it('should not call prop method "setQrDenomination"', () => {
                        const props = getProps({
                            setQrDenomination: jest.fn(),
                        });

                        const wrapper = shallow(<CurrencySelection {...props} />);
                        wrapper.setProps({
                            isFetchingCurrencyData: false,
                            hasErrorFetchingCurrencyData: false,
                        });

                        expect(props.setQrDenomination).toHaveBeenCalledTimes(0);
                    });
                });

                describe('when "qrDenomination" prop value is not included in allowed IOTA denominations', () => {
                    it('should call prop method "setQrDenomination" with newly selected currency ', () => {
                        const props = getProps({
                            setQrDenomination: jest.fn(),
                            qrDenomination: 'foo',
                        });

                        const wrapper = shallow(<CurrencySelection {...props} />);
                        wrapper.setProps({
                            isFetchingCurrencyData: false,
                            hasErrorFetchingCurrencyData: false,
                            currency: 'new currency symbol',
                        });

                        expect(props.setQrDenomination).toHaveBeenCalledWith('new currency symbol');
                    });
                });

                describe('when "sendDenomination" prop value is included in allowed IOTA denominations', () => {
                    it('should not call prop method "setSendDenomination"', () => {
                        const props = getProps({
                            setSendDenomination: jest.fn(),
                        });

                        const wrapper = shallow(<CurrencySelection {...props} />);
                        wrapper.setProps({
                            isFetchingCurrencyData: false,
                            hasErrorFetchingCurrencyData: false,
                        });

                        expect(props.setSendDenomination).toHaveBeenCalledTimes(0);
                    });
                });

                describe('when "sendDenomination" prop value is not included in allowed IOTA denominations', () => {
                    it('should call prop method "setSendDenomination" with newly selected currency ', () => {
                        const props = getProps({
                            setSendDenomination: jest.fn(),
                            sendDenomination: 'foo',
                        });

                        const wrapper = shallow(<CurrencySelection {...props} />);
                        wrapper.setProps({
                            isFetchingCurrencyData: false,
                            hasErrorFetchingCurrencyData: false,
                            currency: 'new currency symbol',
                        });

                        expect(props.setSendDenomination).toHaveBeenCalledWith('new currency symbol');
                    });
                });
            });
        });
    });
});
