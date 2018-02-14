import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { TwoFactorSetupAddKey } from '../../containers/twoFactorSetupAddKey';
import * as keychainUtils from '../../util/keychain';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(() => Promise.resolve({})),
    getGenericPassword: jest.fn(() => Promise.resolve({ username: 'foo', password: [{}], service: 'bundleId' })),
}));

jest.mock('react-native-camera', () => {});

jest.mock('../../util/keychain', () => ({
    storeTwoFactorAuthKeyInKeychain: jest.fn(() => Promise.resolve({})),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            backgroundColor: 'white',
            secondaryBackgroundColor: 'white',
            navigator: {},
            generateAlert: noop,
            t: () => '',
        },
        overrides,
    );

describe('Testing TwoFactorSetupAddKey component', () => {
    describe('propTypes', () => {
        it('should require a backgroundColor string as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.backgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a secondaryBackgroundColor string as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.secondaryBackgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a navigator object as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.navigator).toEqual(PropTypes.object.isRequired);
        });

        it('should require a generateAlert string as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return a DynamicStatusBar component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('DynamicStatusBar').length).toEqual(1);
        });

        it('should return six View components', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('View').length).toEqual(6);
        });

        it('should return an Image component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('Image').length).toEqual(1);
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

        it('should return a StatefulDropdownAlert component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(
                wrapper
                    .children()
                    .last()
                    .name()
                    .includes('StatefulDropdownAlert'),
            ).toEqual(true);
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

                it('should call push method on navigator object in props', () => {
                    const props = getProps({
                        navigator: {
                            push: jest.fn(),
                        },
                    });

                    const instance = shallow(<TwoFactorSetupAddKey {...props} />).instance();
                    return instance.navigateToEnterToken().then(() => {
                        expect(props.navigator.push).toHaveBeenCalledTimes(1);
                    });
                });
            });
        });
    });
});
