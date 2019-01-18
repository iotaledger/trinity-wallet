import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { BiometricAuthentication } from 'ui/views/wallet/BiometricAuthentication';
import * as deviceConstants from 'libs/device';

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
            componentId: '1',
            isModalActive: false,
            modalContent: '',
            generateAlert: noop,
            setFingerprintStatus: noop,
            theme: {
                body: { color: '#ffffff' },
                primary: {},
            },
            t: () => '',
            isFingerprintEnabled: false,
            toggleModalActivity: noop,
        },
        overrides,
    );

describe('Testing BiometricAuthentication component', () => {
    describe('when component updates', () => {
        describe('when isModalActive in current props is false', () => {
            describe('when isModalActive in new props is true', () => {
                describe('when modalContent in new props is "fingerprint"', () => {
                    describe('when platform is "android"', () => {
                        beforeEach(() => {
                            deviceConstants.isAndroid = true;
                        });

                        afterEach(() => {
                            deviceConstants.isAndroid = false;
                        });

                        describe('when fingerprint is enabled', () => {
                            it('should call instance method deactivateFingerprintScanner', () => {
                                const props = getProps({
                                    isFingerprintEnabled: true,
                                });

                                const wrapper = shallow(<BiometricAuthentication {...props} />);
                                const instance = wrapper.instance();

                                jest.spyOn(instance, 'deactivateFingerprintScanner');

                                wrapper.setProps({
                                    modalContent: 'fingerprint',
                                    isModalActive: true,
                                });

                                expect(instance.deactivateFingerprintScanner).toHaveBeenCalledTimes(1);
                            });
                        });

                        describe('when fingerprint is disabled', () => {
                            it('should call instance method activateFingerprintScanner', () => {
                                // isFingerprintEnabled is false by default
                                const props = getProps();

                                const wrapper = shallow(<BiometricAuthentication {...props} />);
                                const instance = wrapper.instance();

                                jest.spyOn(instance, 'activateFingerprintScanner');

                                wrapper.setProps({
                                    modalContent: 'fingerprint',
                                    isModalActive: true,
                                });

                                expect(instance.activateFingerprintScanner).toHaveBeenCalledTimes(1);
                            });
                        });
                    });

                    describe('when platform is not "android"', () => {
                        describe('when fingerprint is enabled', () => {
                            it('should not call instance method deactivateFingerprintScanner', () => {
                                const props = getProps({
                                    isFingerprintEnabled: true,
                                });

                                const wrapper = shallow(<BiometricAuthentication {...props} />);
                                const instance = wrapper.instance();

                                jest.spyOn(instance, 'deactivateFingerprintScanner');

                                wrapper.setProps({
                                    modalContent: 'fingerprint',
                                    isModalActive: true,
                                });

                                expect(instance.deactivateFingerprintScanner).toHaveBeenCalledTimes(0);
                            });
                        });

                        describe('when fingerprint is disabled', () => {
                            it('should not call instance method activateFingerprintScanner', () => {
                                // isFingerprintEnabled is false by default
                                const props = getProps();

                                const wrapper = shallow(<BiometricAuthentication {...props} />);
                                const instance = wrapper.instance();

                                jest.spyOn(instance, 'activateFingerprintScanner');

                                wrapper.setProps({
                                    modalContent: 'fingerprint',
                                    isModalActive: true,
                                });

                                expect(instance.activateFingerprintScanner).toHaveBeenCalledTimes(0);
                            });
                        });
                    });
                });
            });
        });
    });
});
