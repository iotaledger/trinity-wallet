import React from 'react';
import { shallow } from 'enzyme';

import Select from 'ui/components/input/Select';

const props = {
    value: 'Foo',
    valueLabel: 'Foo Bar',
    options: [
        {
            value: 'Foo',
            label: 'Foo Bar',
        },
        {
            value: 'Fizz',
            label: 'Fizz Buzz',
        },
    ],
    label: 'Lorem Ipsum',
    onChange: jest.fn(),
};

describe('Select component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Select {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Input value', () => {
        const wrapper = shallow(<Select {...props} />);

        expect(wrapper.find('.selectable').text()).toEqual('Foo Bar');
    });

    test('Input change callback', () => {
        const wrapper = shallow(<Select {...props} />);

        wrapper.setState({ open: true });

        wrapper
            .find('li')
            .last()
            .simulate('click');

        expect(props.onChange).toHaveBeenLastCalledWith('Fizz');
    });

    test('Input disabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<Select {...mockProps} />);

        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });
});
