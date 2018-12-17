import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import PropTypes from 'prop-types';
import { SetAccountName } from 'ui/views/onboarding/SetAccountName';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));
jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
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
            componentId: 'foo',
            accountNames: [],
            generateAlert: noop,
            setAdditionalAccountInfo: noop,
            t: () => '',
            accountCount: 0,
            seed: 'SEED',
            onboardingComplete: false,
            theme: { body: { bg: '#ffffff', color: '#000000' }, primary: {} },
            password: {},
            shouldPreventAction: false,
        },
        overrides,
    );

describe('Testing SetAccountName component', () => {
    describe('propTypes', () => {
        it('should require a componentId object as a prop', () => {
            expect(SetAccountName.propTypes.componentId).toEqual(PropTypes.string.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(SetAccountName.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a setAccountInfoDuringSetup function as a prop', () => {
            expect(SetAccountName.propTypes.setAccountInfoDuringSetup).toEqual(PropTypes.func.isRequired);
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

        it('should require a theme object as a prop', () => {
            expect(SetAccountName.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a password object as a prop', () => {
            expect(SetAccountName.propTypes.password).toEqual(PropTypes.object.isRequired);
        });

        it('should require a shouldPreventAction boolean as a prop', () => {
            expect(SetAccountName.propTypes.shouldPreventAction).toEqual(PropTypes.bool.isRequired);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('onDonePress', () => {
                it('should call setAccountInfoDuringSetup prop method with trimmed accountName state prop', () => {
                    const props = getProps({
                        setAccountInfoDuringSetup: jest.fn(),
                    });

                    const wrapper = shallow(<SetAccountName {...props} />);
                    wrapper.setState({ accountName: '    foo   ' });
                    const inst = wrapper.instance();
                    inst.onDonePress();

                    expect(props.setAccountInfoDuringSetup).toHaveBeenCalledWith({
                        name: 'foo',
                        meta: { type: 'keychain' },
                        completed: true,
                    });
                });

                it('should call update accountName prop in state with text when onChangeText prop method on CustomTextInput is triggered', () => {
                    const props = getProps();

                    const wrapper = shallow(<SetAccountName {...props} />);

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
