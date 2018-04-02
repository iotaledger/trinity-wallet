import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { EnterPasswordOnLogin } from '../../components/EnterPasswordOnLogin';

const getProps = (overrides) =>
    assign(
        {},
        {
            password: '',
            theme: { body: {} },
            onLoginPress: noop,
            navigateToNodeSelection: noop,
            setLoginPasswordField: noop,
            t: () => '',
        },
        overrides,
    );

describe('Testing EnterPasswordOnLogin component', () => {
    describe('propTypes', () => {
        it('should require a theme object as a prop', () => {
            expect(EnterPasswordOnLogin.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a password string as a prop', () => {
            expect(EnterPasswordOnLogin.propTypes.password).toEqual(PropTypes.string.isRequired);
        });

        it('should require a onLoginPress function as a prop', () => {
            expect(EnterPasswordOnLogin.propTypes.onLoginPress).toEqual(PropTypes.func.isRequired);
        });

        it('should require a navigateToNodeSelection function as a prop', () => {
            expect(EnterPasswordOnLogin.propTypes.navigateToNodeSelection).toEqual(PropTypes.func.isRequired);
        });

        it('should require a setLoginPasswordField function as a prop', () => {
            expect(EnterPasswordOnLogin.propTypes.setLoginPasswordField).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(EnterPasswordOnLogin.propTypes.t).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<EnterPasswordOnLogin {...props} />);
            expect(wrapper.name()).toEqual('TouchableWithoutFeedback');
        });

        it('should return a "CustomTextInput" component', () => {
            const props = getProps();

            const wrapper = shallow(<EnterPasswordOnLogin {...props} />);

            expect(wrapper.find('CustomTextInput').length).toEqual(1);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('handleChangeText', () => {
                it('should call prop method "setLoginPasswordField" with parameters', () => {
                    const props = getProps({
                        setLoginPasswordField: jest.fn(),
                    });

                    const wrapper = shallow(<EnterPasswordOnLogin {...props} />);
                    const instance = wrapper.instance();

                    instance.handleChangeText('foo');

                    expect(props.setLoginPasswordField).toHaveBeenCalledWith('foo');
                });
            });

            describe('handleLogin', () => {
                it('should call prop method "onLoginPress" with prop "password"', () => {
                    const props = getProps({
                        password: 'foo',
                        onLoginPress: jest.fn(),
                    });

                    const wrapper = shallow(<EnterPasswordOnLogin {...props} />);
                    const instance = wrapper.instance();

                    instance.handleLogin();

                    expect(props.onLoginPress).toHaveBeenCalledWith('foo');
                });
            });

            describe('changeNode', () => {
                it('should call prop method "navigateToNodeSelection"', () => {
                    const props = getProps({
                        navigateToNodeSelection: jest.fn(),
                    });

                    const wrapper = shallow(<EnterPasswordOnLogin {...props} />);
                    const instance = wrapper.instance();

                    expect(props.navigateToNodeSelection).toHaveBeenCalledTimes(0);

                    instance.changeNode();

                    expect(props.navigateToNodeSelection).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
