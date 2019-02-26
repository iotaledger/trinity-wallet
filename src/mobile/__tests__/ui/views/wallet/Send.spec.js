import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { Send } from 'ui/views/wallet/Send';
import theme from '../../../../__mocks__/theme';

jest.mock('react-native-camera', () => {});
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
            t: () => 'foo',
            currency: 'USD',
            balance: 0,
            isSyncing: false,
            seedIndex: 0,
            selectedAccountName: 'foo',
            selectedAccountMeta: { type: 'keychain' },
            conversionRate: 5,
            usdPrice: 10,
            isGettingSensitiveInfoToMakeTransaction: false,
            prepareTransfer: noop,
            generateAlert: noop,
            getFromKeychainRequest: noop,
            getFromKeychainSuccess: noop,
            getFromKeychainError: noop,
            closeTopBar: noop,
            isSendingTransfer: false,
            isTransitioning: false,
            address: '9'.repeat(81),
            theme,
            amount: '10',
            message: 'baz',
            setSendAddressField: noop,
            setSendAmountField: noop,
            setSendMessageField: noop,
            setSendDenomination: noop,
            denomination: 'i',
            resetProgress: noop,
            startTrackingProgress: noop,
            activeStepIndex: 0,
            activeSteps: [],
            timeTakenByEachProgressStep: [],
            remotePoW: false,
            makeTransaction: noop,
            generateTransferErrorAlert: noop,
            availableBalance: 100,
            deepLinkActive: false,
            setDeepLinkInactive: noop,
            isFingerprintEnabled: false,
            setDoNotMinimise: noop,
            isIOSKeyboardActive: false,
            toggleModalActivity: noop,
            isModalActive: false,
            selectedAccountType: 'keychain',
            isKeyboardActive: false,
        },
        overrides,
    );

describe('Testing Send component', () => {
    describe('instance methods', () => {
        describe('when called', () => {
            describe('#resetMaxPressed', () => {
                describe('when state prop maxPressed is false', () => {
                    it('should not set maxPressed prop to true', () => {
                        const props = getProps();

                        const wrapper = shallow(<Send {...props} />);
                        const instance = wrapper.instance();

                        expect(wrapper.state().maxPressed).toEqual(false);

                        instance.resetMaxPressed();

                        expect(wrapper.state().maxPressed).toEqual(false);
                    });
                });

                describe('when state prop maxPressed is true', () => {
                    it('should set maxPressed prop to false', () => {
                        const props = getProps();

                        const wrapper = shallow(<Send {...props} />);
                        const instance = wrapper.instance();

                        wrapper.setState({ maxPressed: true });

                        instance.resetMaxPressed();

                        expect(wrapper.state().maxPressed).toEqual(false);
                    });
                });
            });
        });
    });
});
