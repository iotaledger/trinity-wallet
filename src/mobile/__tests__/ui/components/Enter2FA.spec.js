import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { Enter2FA } from 'ui/components/Enter2FA';
import theme from '../../../__mocks__/theme';

const getProps = (overrides) =>
    assign(
        {},
        {
            verify: noop,
            theme,
            cancel: noop,
            t: () => '',
        },
        overrides,
    );

jest.mock('react-native-camera', () => ({}));

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

describe('Testing Enter2FA component', () => {
    describe('propTypes', () => {
        it('should require a verify function as a prop', () => {
            expect(Enter2FA.propTypes.verify).toEqual(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(Enter2FA.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a cancel function as a prop', () => {
            expect(Enter2FA.propTypes.cancel).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(Enter2FA.propTypes.t).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Enter2FA {...props} />);
            expect(wrapper.name()).toEqual('TouchableWithoutFeedback');
        });

        it('should return a "CustomTextInput" component', () => {
            const props = getProps();

            const wrapper = shallow(<Enter2FA {...props} />);

            expect(wrapper.find('CustomTextInput').length).toEqual(1);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('handleChange2FAToken', () => {
                it('should set param value to "token" state prop', () => {
                    const props = getProps();

                    const wrapper = shallow(<Enter2FA {...props} />);
                    const instance = wrapper.instance();

                    expect(wrapper.state().token).toEqual('');

                    instance.handleChange2FAToken('foo');

                    expect(wrapper.state().token).toEqual('foo');
                });
            });

            describe('handleDonePress', () => {
                it('should call prop method "verify" with state prop "token"', () => {
                    const props = getProps({
                        verify: jest.fn(),
                    });

                    const wrapper = shallow(<Enter2FA {...props} />);
                    const instance = wrapper.instance();

                    wrapper.setState({ token: 'foo' });

                    instance.handleDonePress();

                    expect(props.verify).toHaveBeenCalledWith('foo');
                });
            });

            describe('handleBackPress', () => {
                it('should call prop method "cancel"', () => {
                    const props = getProps({
                        cancel: jest.fn(),
                    });

                    const wrapper = shallow(<Enter2FA {...props} />);
                    const instance = wrapper.instance();

                    expect(props.cancel).toHaveBeenCalledTimes(0);

                    instance.handleBackPress();

                    expect(props.cancel).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
