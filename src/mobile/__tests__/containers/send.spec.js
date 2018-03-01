import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { Send } from '../../containers/send';

jest.mock('react-native-camera', () => {});
jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            t: () => 'foo',
            currency: 'USD',
            balance: 0,
            isSyncing: false,
            seedIndex: 0,
            selectedAccountName: 'foo',
            conversionRate: 5,
            usdPrice: 10,
            isGettingSensitiveInfoToMakeTransaction: false,
            prepareTransfer: noop,
            generateAlert: noop,
            getFromKeychainRequest: noop,
            getFromKeychainSuccess: noop,
            getFromKeychainError: noop,
            closeTopBar: noop,
            ctaColor: 'white',
            backgroundColor: 'white',
            barColor: 'red',
            negativeColor: 'blue',
            isSendingTransfer: false,
            secondaryCtaColor: 'black',
            secondaryBarColor: 'brown',
            secondaryBackgroundColor: 'blue',
            ctaBorderColor: 'yellow',
            isTransitioning: false,
            address: '9'.repeat(81),
            amount: '10',
            message: 'baz',
            setSendAddressField: noop,
            setSendAmountField: noop,
            setSendMessageField: noop,
            setSendDenomination: noop,
            denomination: 'i',
        },
        overrides,
    );

describe('Testing Send component', () => {
    describe('instance methods', () => {
        describe('when called', () => {
            describe('#resetToggleSwitch', () => {
                describe('when state prop maxPressed is false', () => {
                    it('should not set maxPressed prop to true', () => {
                        const props = getProps();

                        const wrapper = shallow(<Send {...props} />);
                        const instance = wrapper.instance();

                        expect(wrapper.state().maxPressed).toEqual(false);

                        instance.resetToggleSwitch();

                        expect(wrapper.state().maxPressed).toEqual(false);
                    });
                });

                describe('when state prop maxPressed is true', () => {
                    it('should set maxPressed prop to false', () => {
                        const props = getProps();

                        const wrapper = shallow(<Send {...props} />);
                        const instance = wrapper.instance();

                        wrapper.setState({ maxPressed: true });

                        instance.resetToggleSwitch();

                        expect(wrapper.state().maxPressed).toEqual(false);
                    });
                });
            });
        });
    });
});
