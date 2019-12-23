import React from 'react';
import { shallow } from 'enzyme';

import Address from 'ui/components/input/Address';

const props = {
    address: 'ABC',
    label: 'Foo',
    closeLabel: 'Bar',
    onChange: jest.fn(),
    verifyCDAContent: jest.fn()
};

describe('Address component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Address {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Address value', () => {
        const wrapper = shallow(<Address {...props} />);

        expect(wrapper.find('input').props().value).toEqual('ABC');
    });

    test('Address change callback', () => {
        const wrapper = shallow(<Address {...props} />);

        wrapper.find('input').simulate('change', { target: { value: 'ABCDEF' } });
        expect(props.onChange).toHaveBeenLastCalledWith('ABCDEF');
    });

    test('Address label', () => {
        const wrapper = shallow(<Address {...props} />);

        expect(wrapper.find('small').text()).toEqual('Foo');
    });
});
