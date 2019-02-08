import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { TwoFactorSetupAddKey } from 'ui/views/wallet/TwoFactorSetupAddKey';
import * as keychainUtils from 'libs/keychain';
import theme from '../../../../__mocks__/theme';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(() => Promise.resolve({})),
    getGenericPassword: jest.fn(() => Promise.resolve({ username: 'foo', password: [{}], service: 'bundleId' })),
}));

jest.mock('react-native-camera', () => {});

jest.mock('libs/keychain', () => ({
    storeTwoFactorAuthKeyInKeychain: jest.fn(() => Promise.resolve({})),
}));

jest.mock('libs/navigation', () => ({
    navigator: {
        push: jest.fn(),
    },
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            theme,
            generateAlert: noop,
            componentId: 'foo',
            t: () => '',
        },
        overrides,
    );

describe('Testing TwoFactorSetupAddKey component', () => {
    describe('propTypes', () => {
        it('should require a theme object as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a componentId string as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.componentId).toEqual(PropTypes.string.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return five View components', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('View').length).toEqual(5);
        });

        it('should return a QRCode component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('QRCode').length).toEqual(1);
        });

        it('should return a TouchableOpacity component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('TouchableOpacity').length).toEqual(1);
        });

        it('should return four Text components', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('Text').length).toEqual(5);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#onKeyPress', () => {
                afterEach(() => {
                    if (Clipboard.setString.mockClear) {
                        Clipboard.setString.mockClear();
                    }
                });

                it('should not call setString on Clipboard and prop method generateAlert if argument is null, undefined, or empty string', () => {
                    const props = getProps({
                        generateAlert: jest.fn(),
                    });

                    jest.spyOn(Clipboard, 'setString');
                    const instance = shallow(<TwoFactorSetupAddKey {...props} />).instance();
                    [null, undefined, ''].forEach((item) => {
                        instance.onKeyPress(item);

                        expect(Clipboard.setString).toHaveBeenCalledTimes(0);
                        expect(props.generateAlert).toHaveBeenCalledTimes(0);
                    });
                });

                it('should call setString on Clipboard and prop method generateAlert if argument is a string', () => {
                    const props = getProps({
                        generateAlert: jest.fn(),
                    });

                    jest.spyOn(Clipboard, 'setString');
                    const instance = shallow(<TwoFactorSetupAddKey {...props} />).instance();
                    instance.onKeyPress('key');

                    expect(Clipboard.setString).toHaveBeenCalledWith('key');
                    expect(props.generateAlert).toHaveBeenCalledTimes(1);
                });
            });

            describe('#navigateToEnterToken', () => {
                afterEach(() => {
                    if (Clipboard.setString.mockClear) {
                        Clipboard.setString.mockClear();
                    }

                    if (keychainUtils.storeTwoFactorAuthKeyInKeychain.mockClear) {
                        keychainUtils.storeTwoFactorAuthKeyInKeychain.mockClear();
                    }
                });

                it('should call setString on Clipboard with empty strings', () => {
                    const props = getProps({
                        navigator: {
                            push: noop,
                        },
                    });

                    jest.spyOn(Clipboard, 'setString');
                    const instance = shallow(<TwoFactorSetupAddKey {...props} />).instance();
                    instance.navigateToEnterToken();

                    expect(Clipboard.setString).toHaveBeenCalledWith(' ');
                });

                it('should call storeTwoFactorAuthKeyInKeychain method in util/keychain module', () => {
                    const props = getProps({
                        navigator: {
                            push: noop,
                        },
                    });

                    const instance = shallow(<TwoFactorSetupAddKey {...props} />).instance();
                    instance.navigateToEnterToken();

                    expect(keychainUtils.storeTwoFactorAuthKeyInKeychain).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
