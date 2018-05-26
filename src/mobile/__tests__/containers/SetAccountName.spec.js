import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import PropTypes from 'prop-types';
import { SetAccountName } from '../../containers/SetAccountName';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            navigator: {
                push: noop,
            },
            setAccountName: noop,
            generateAlert: noop,
            setAdditionalAccountInfo: noop,
            t: (arg) => {
                const translations = {
                    'global:mainWallet': 'MAIN ACCOUNT',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
            seed: 'SEED',
            onboardingComplete: false,
            seedCount: 0,
            theme: { body: { bg: '#ffffff', color: '#000000' }, primary: {} },
            password: 'foo',
            shouldPreventAction: false,
        },
        overrides,
    );

describe('Testing SetAccountName component', () => {
    describe('propTypes', () => {
        it('should require a navigator object as a prop', () => {
            expect(SetAccountName.propTypes.navigator).toEqual(PropTypes.object.isRequired);
        });

        it('should require a setAccountName function as a prop', () => {
            expect(SetAccountName.propTypes.setAccountName).toEqual(PropTypes.func.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(SetAccountName.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a setAdditionalAccountInfo function as a prop', () => {
            expect(SetAccountName.propTypes.setAdditionalAccountInfo).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(SetAccountName.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a seed string as a prop', () => {
            expect(SetAccountName.propTypes.seed).toEqual(PropTypes.string.isRequired);
        });

        it('should require a onboardingComplete bool as a prop', () => {
            expect(SetAccountName.propTypes.onboardingComplete).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a seedCount number as a prop', () => {
            expect(SetAccountName.propTypes.seedCount).toEqual(PropTypes.number.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(SetAccountName.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a password string as a prop', () => {
            expect(SetAccountName.propTypes.password).toEqual(PropTypes.string.isRequired);
        });

        it('should require a shouldPreventAction boolean as a prop', () => {
            expect(SetAccountName.propTypes.shouldPreventAction).toEqual(PropTypes.bool.isRequired);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('onDonePress', () => {
                it('should call setAccountName prop method with trimmed accountName state prop', () => {
                    const props = getProps({
                        setAccountName: jest.fn(),
                    });

                    const wrapper = shallow(<SetAccountName {...props} />);
                    wrapper.setState({ accountName: '    foo   ' });
                    const inst = wrapper.instance();
                    inst.onDonePress();

                    expect(props.setAccountName).toHaveBeenCalledWith('foo');
                });

                it('should call update accountName prop in state with text when onChangeText prop method on CustomTextInput is triggered', () => {
                    const props = getProps();

                    const wrapper = shallow(<SetAccountName {...props} />);

                    expect(wrapper.state('accountName')).toEqual('MAIN ACCOUNT');

                    wrapper
                        .find('CustomTextInput')
                        .props()
                        .onChangeText('foo');

                    expect(wrapper.state('accountName')).toEqual('foo');
                });
            });
        });
    });
});
