import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import CustomTextInput from 'ui/components/CustomTextInput';
import theme from '../../../__mocks__/theme';

const getProps = (overrides) =>
    assign(
        {},
        {
            onValidTextChange: noop,
            label: 'foo',
            theme,
        },
        overrides,
    );

describe('Testing CustomTextInput component', () => {
    describe('propTypes', () => {
        it('should require an onValidTextChange function as a prop', () => {
            expect(CustomTextInput.propTypes.onValidTextChange).toEqual(PropTypes.func);
        });

        it('should require a theme object as a prop', () => {
            expect(CustomTextInput.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a label string as a prop', () => {
            expect(CustomTextInput.propTypes.label).toEqual(PropTypes.string);
        });

        it('should accept an onFocus function as a prop', () => {
            expect(CustomTextInput.propTypes.onFocus).toEqual(PropTypes.func);
        });

        it('should accept an onBlur function as a prop', () => {
            expect(CustomTextInput.propTypes.onBlur).toEqual(PropTypes.func);
        });

        it('should accept a containerStyle object as a prop', () => {
            expect(CustomTextInput.propTypes.containerStyle).toEqual(PropTypes.object);
        });

        it('should accept a onDenominationPress function as a prop', () => {
            expect(CustomTextInput.propTypes.onDenominationPress).toEqual(PropTypes.func);
        });

        it('should accept a denominationText string as a prop', () => {
            expect(CustomTextInput.propTypes.denominationText).toEqual(PropTypes.string);
        });

        it('should accept a onQRPress function as a prop', () => {
            expect(CustomTextInput.propTypes.onQRPress).toEqual(PropTypes.func);
        });

        it('should accept a fingerprintAuthentication boolean as a prop', () => {
            expect(CustomTextInput.propTypes.fingerprintAuthentication).toEqual(PropTypes.bool);
        });

        it('should accept a onFingerprintPress function as a prop', () => {
            expect(CustomTextInput.propTypes.onFingerprintPress).toEqual(PropTypes.func);
        });

        it('should accept a innerPadding object as a prop', () => {
            expect(CustomTextInput.propTypes.innerPadding).toEqual(PropTypes.object);
        });

        it('should accept a currencyConversion boolean as a prop', () => {
            expect(CustomTextInput.propTypes.currencyConversion).toEqual(PropTypes.bool);
        });

        it('should accept a conversionText string as a prop', () => {
            expect(CustomTextInput.propTypes.conversionText).toEqual(PropTypes.string);
        });

        it('should accept a height number as a prop', () => {
            expect(CustomTextInput.propTypes.height).toEqual(PropTypes.number);
        });

        it('should accept a onRef function as a prop', () => {
            expect(CustomTextInput.propTypes.onRef).toEqual(PropTypes.func);
        });

        it('should accept a testID string as a prop', () => {
            expect(CustomTextInput.propTypes.testID).toEqual(PropTypes.string);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<CustomTextInput {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return "label" prop (uppercased) as a child to "Text" component', () => {
            const props = getProps();

            const wrapper = shallow(<CustomTextInput {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .children()
                    .text(),
            ).toEqual('FOO');
        });

        it('should return a "TextInput" component', () => {
            const props = getProps();

            const wrapper = shallow(<CustomTextInput {...props} />);
            expect(wrapper.find('TextInput').length).toEqual(1);
        });
    });

    describe('lifecycle methods', () => {
        describe('when called', () => {
            describe('#componentDidMount', () => {
                describe('when prop method "onRef" is defined', () => {
                    it('should call prop method "onRef" with component instance', () => {
                        const props = getProps({
                            onRef: jest.fn(),
                        });

                        const instance = shallow(<CustomTextInput {...props} />).instance();
                        expect(props.onRef).toHaveBeenCalledWith(instance);
                    });
                });
            });

            describe('#componentWillUnmount', () => {
                describe('when prop method "onRef" is defined', () => {
                    it('should call prop method "onRef" with null', () => {
                        const props = getProps({
                            onRef: jest.fn(),
                        });

                        const wrapper = shallow(<CustomTextInput {...props} />);
                        wrapper.unmount();
                        expect(props.onRef).toHaveBeenCalledWith(null);
                    });
                });
            });
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#onFocus', () => {
                it('should set state prop "isFocused" to true', () => {
                    const props = getProps();

                    const wrapper = shallow(<CustomTextInput {...props} />);
                    const instance = wrapper.instance();

                    expect(wrapper.state().isFocused).toEqual(false);
                    instance.onFocus();
                    expect(wrapper.state().isFocused).toEqual(true);
                });
            });

            describe('#onBlur', () => {
                it('should set state prop "isFocused" to false', () => {
                    const props = getProps();

                    const wrapper = shallow(<CustomTextInput {...props} />);
                    wrapper.setState({ isFocused: true });

                    const instance = wrapper.instance();

                    instance.onBlur();
                    expect(wrapper.state().isFocused).toEqual(false);
                });
            });
        });
    });
});
