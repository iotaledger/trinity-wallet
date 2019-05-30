import React from 'react';
import { shallow } from 'enzyme';

import Number from 'ui/components/input/Number';

const props = {
    value: 10,
    label: 'Foo',
    onChange: jest.fn(),
};

describe('TeNumberxt component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Number {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Input value', () => {
        const wrapper = shallow(<Number {...props} />);

        expect(wrapper.find('input').props().value).toEqual(10);
    });

    test('Input change callback', () => {
        const wrapper = shallow(<Number {...props} />);

        wrapper.find('input').simulate('change', { target: { value: '30' } });
        expect(props.onChange).toHaveBeenLastCalledWith(30);
    });

    test('Input label', () => {
        const wrapper = shallow(<Number {...props} />);

        expect(wrapper.find('small').text()).toEqual('Foo');
    });

    test('Input decrement callback', () => {
        const wrapper = shallow(<Number {...props} />);

        wrapper
            .find('span')
            .first()
            .simulate('click');
        expect(props.onChange).toHaveBeenLastCalledWith(9);
    });

    test('Input decrement callback', () => {
        const wrapper = shallow(<Number {...props} />);

        wrapper
            .find('span')
            .last()
            .simulate('click');
        expect(props.onChange).toHaveBeenLastCalledWith(11);
    });
});
