import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import Tab from 'ui/components/Tab';
import theme from '../../../__mocks__/theme';

const getProps = (overrides) =>
    assign(
        {},
        {
            icon: 'iota',
            text: 'foo',
            theme,
            isActive: false,
            onPress: noop,
            name: 'send',
        },
        overrides,
    );

describe('Testing Tab component', () => {
    describe('propTypes', () => {
        it('should require an icon string as a prop', () => {
            expect(Tab.propTypes.icon).toEqual(PropTypes.string.isRequired);
        });

        it('should require a text string as a prop', () => {
            expect(Tab.propTypes.text).toEqual(PropTypes.string.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(Tab.propTypes.theme).toEqual(PropTypes.object.isRequired);
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

            const icon = wrapper.find('AnimatedIcon');

            expect(icon.props().name).toEqual('iota');
        });

        it('should return "text" prop as a direct child of Text component', () => {
            const props = getProps();

            const wrapper = shallow(<Tab {...props} />);

            // FIXME: We should wrap this component so we can name it ourselves
            const text = wrapper.find('AnimatedComponent');

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
