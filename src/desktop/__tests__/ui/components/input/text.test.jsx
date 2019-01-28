import React from 'react';
import { shallow } from 'enzyme';

import Text from 'ui/components/input/Text';

const props = {
    value: 'Foo Bar',
    label: 'Foo',
    onChange: jest.fn(),
};

describe('Text component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Text {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Input value', () => {
        const wrapper = shallow(<Text {...props} />);

        expect(wrapper.find('input').props().value).toEqual('Foo Bar');
    });

    test('Input change callback', () => {
        const wrapper = shallow(<Text {...props} />);

        wrapper.find('input').simulate('change', { target: { value: 'Bar' } });
        expect(props.onChange).toHaveBeenLastCalledWith('Bar');
    });

    test('Input label', () => {
        const wrapper = shallow(<Text {...props} />);

        expect(wrapper.find('small').text()).toEqual('Foo');
    });

    test('Input disabled state', () => {
        const mockProps = Object.assign(props, { disabled: true });
        const wrapper = shallow(<Text {...mockProps} />);

        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });
});
