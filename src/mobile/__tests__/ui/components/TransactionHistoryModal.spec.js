import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import TransactionHistoryModal from 'ui/components/TransactionHistoryModal';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            hideModal: noop,
            t: (arg) => {
                const translations = {
                    'send:message': 'Message',
                    addresses: 'Addresses',
                    bundleHash: 'Bundle Hash',
                    bundleHashCopied: 'Bundle hash copied',
                    bundleHashCopiedExplanation: 'Your bundle has been copied to clipboard',
                    addressCopied: 'Address copied',
                    addressCopiedExplanation: 'Your address has been copied to clipboard',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
            promote: noop,
            outputs: [],
            disableWhen: false,
            value: 200,
            fullValue: 200,
            unit: 'i',
            persistence: false,
            incoming: false,
            time: Date.now(),
            message: 'Pink floyd',
            bundle: 'BUNDLE',
            relevantAddresses: [{ address: 'U'.repeat(81), value: 1, unit: 'i' }],
            mode: 'Standard',
            generateAlert: noop,
            style: {
                titleColor: 'white',
                containerBorderColor: { borderColor: 'white' },
                containerBackgroundColor: { backgroundColor: 'white' },
                confirmationStatusColor: { color: 'red' },
                defaultTextColor: { color: 'green' },
                backgroundColor: 'white',
                borderColor: { borderColor: 'orange' },
                barBg: 'black',
                barColor: 'white',
                buttonsOpacity: { opacity: 1 },
                primaryColor: '#ffffff',
                primaryBody: '#000000',
            },
            bundleIsBeingPromoted: false,
            isFailedTransaction: false,
            retryFailedTransaction: noop,
            isRetryingFailedTransaction: false,
        },
        overrides,
    );

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

describe('Testing TransactionHistoryModal component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(TransactionHistoryModal.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a value number as a prop', () => {
            expect(TransactionHistoryModal.propTypes.value).toEqual(PropTypes.number.isRequired);
        });

        it('should require a fullValue number as a prop', () => {
            expect(TransactionHistoryModal.propTypes.fullValue).toEqual(PropTypes.number.isRequired);
        });

        it('should require a unit string as a prop', () => {
            expect(TransactionHistoryModal.propTypes.unit).toEqual(PropTypes.string.isRequired);
        });

        it('should require a time number as a prop', () => {
            expect(TransactionHistoryModal.propTypes.time).toEqual(PropTypes.number.isRequired);
        });

        it('should require a message string as a prop', () => {
            expect(TransactionHistoryModal.propTypes.message).toEqual(PropTypes.string);
        });

        it('should require a bundle string as a prop', () => {
            expect(TransactionHistoryModal.propTypes.bundle).toEqual(PropTypes.string.isRequired);
        });

        it('should require a disableWhen boolean as a prop', () => {
            expect(TransactionHistoryModal.propTypes.disableWhen).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a bundleIsBeingPromoted boolean as a prop', () => {
            expect(TransactionHistoryModal.propTypes.bundleIsBeingPromoted).toEqual(PropTypes.bool.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionHistoryModal {...props} />);
            expect(wrapper.name()).toEqual('Connect(ModalViewComponent)');
        });

        it('should return a ScrollView component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionHistoryModal {...props} />);
            expect(wrapper.find('ScrollViewMock').length).toEqual(0);
        });

        it('should call instance method copy with bundle prop and "bundle" string when onPress prop of second TouchableOpacity is triggered', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionHistoryModal {...props} />);
            const instance = wrapper.instance();

            jest.spyOn(instance, 'copy');
            const touchableOpacity = wrapper.find('TouchableOpacity').at(0);

            touchableOpacity.props().onPress();

            expect(instance.copy).toHaveBeenCalledWith('BUNDLE', 'bundle');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#copy', () => {
                afterEach(() => {
                    if (Clipboard.setString.mockClear) {
                        Clipboard.setString.mockClear();
                    }
                });

                it('should call setString on Clipboard with first argument', () => {
                    const props = getProps();
                    jest.spyOn(Clipboard, 'setString');

                    const instance = shallow(<TransactionHistoryModal {...props} />).instance();
                    instance.copy('arg', 'type');

                    expect(Clipboard.setString).toHaveBeenCalledWith('arg');
                });
            });
        });
    });
});
