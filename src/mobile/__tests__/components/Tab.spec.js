import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import Tab from '../../components/Tab';

const getProps = (overrides) =>
    assign(
        {},
        {
            icon: 'iota',
            textColor: {},
            text: 'foo',
            iconColor: '#ffffff',
            activeColor: '#dddddd',
            activeBorderColor: '#dedede',
            isActive: false,
            onPress: noop,
        },
        overrides,
    );

describe('Testing SeedBox component', () => {
    describe('propTypes', () => {
        it('should require an icon string as a prop', () => {
            expect(Tab.propTypes.icon).toEqual(PropTypes.string.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(Tab.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a text string as a prop', () => {
            expect(Tab.propTypes.text).toEqual(PropTypes.string.isRequired);
        });

        it('should require an iconColor string as a prop', () => {
            expect(Tab.propTypes.iconColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require an activeColor string as a prop', () => {
            expect(Tab.propTypes.activeColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require an activeBorderColor string as a prop', () => {
            expect(Tab.propTypes.activeBorderColor).toEqual(PropTypes.string.isRequired);
        });

        it('should accept an onPress function as a prop', () => {
            expect(Tab.propTypes.onPress).toEqual(PropTypes.func);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Tab {...props} />);
            expect(wrapper.name()).toEqual('TouchableWithoutFeedback');
        });

        it('should pass icon prop to "name" prop of Icon component', () => {
            const props = getProps();

            const wrapper = shallow(<Tab {...props} />);
            const icon = wrapper.find('Icon');

            expect(icon.props().name).toEqual('iota');
        });

        it('should return "text" prop as a direct child of Text component', () => {
            const props = getProps();

            const wrapper = shallow(<Tab {...props} />);
            const text = wrapper.find('Text');

            expect(text.children().text()).toEqual('foo');
        });

        it('should call prop method "onPress" when onPress prop of TouchableOpacity is triggered', () => {
            const props = getProps({ onPress: jest.fn() });

            const wrapper = shallow(<Tab {...props} />);

            expect(props.onPress).toHaveBeenCalledTimes(0);

            wrapper.props().onPress();

            expect(props.onPress).toHaveBeenCalledTimes(1);
        });
    });
});
