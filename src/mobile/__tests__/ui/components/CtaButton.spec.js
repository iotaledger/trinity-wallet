import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import CtaButton from 'ui/components/CtaButton';

const getProps = (overrides) =>
    assign(
        {},
        {
            onPress: noop,
            ctaColor: '#ffffff',
            secondaryCtaColor: '#000000',
            text: 'foo',
        },
        overrides,
    );

describe('Testing CtaButton component', () => {
    describe('propTypes', () => {
        it('should require an onPress function as a prop', () => {
            expect(CtaButton.propTypes.onPress).toEqual(PropTypes.func.isRequired);
        });

        it('should require a ctaColor string as a prop', () => {
            expect(CtaButton.propTypes.ctaColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a secondaryCtaColor string as a prop', () => {
            expect(CtaButton.propTypes.secondaryCtaColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a text string as a prop', () => {
            expect(CtaButton.propTypes.text).toEqual(PropTypes.string);
        });

        it('should accept a ctaWidth number as a prop', () => {
            expect(CtaButton.propTypes.ctaWidth).toEqual(PropTypes.number);
        });

        it('should accept a ctaHeight number as a prop', () => {
            expect(CtaButton.propTypes.ctaHeight).toEqual(PropTypes.number);
        });

        it('should accept a fontSize number as a prop', () => {
            expect(CtaButton.propTypes.fontSize).toEqual(PropTypes.number);
        });

        it('should accept a testID number as a prop', () => {
            expect(CtaButton.propTypes.testID).toEqual(PropTypes.string);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<CtaButton {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return a TouchableOpacity component', () => {
            const props = getProps();

            const wrapper = shallow(<CtaButton {...props} />);
            expect(wrapper.find('TouchableOpacity').length).toEqual(1);
        });

        it('should return prop "text" value as a children of "Text" component', () => {
            const props = getProps();

            const wrapper = shallow(<CtaButton {...props} />);
            const text = wrapper.find('Text');
            expect(text.children().text()).toEqual('foo');
        });
    });

    describe('when press event of TouchableOpacity is triggered', () => {
        it('should call prop method "onPress"', () => {
            const props = getProps({
                onPress: jest.fn(),
            });

            const wrapper = shallow(<CtaButton {...props} />);
            const touchableOpacity = wrapper.find('TouchableOpacity');
            touchableOpacity.props().onPress();

            expect(props.onPress).toHaveBeenCalledTimes(1);
        });
    });
});
