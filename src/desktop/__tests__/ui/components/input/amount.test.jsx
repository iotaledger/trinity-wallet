import React from 'react';
import { shallow } from 'enzyme';

import Amount from 'ui/components/input/Amount';

const props = {
    amount: '1500000',
    balance: 4000000,
    settings: {
        conversionRate: 1,
        currency: 'USD',
        usdPrice: 1,
    },
    label: 'Foo',
    labelMax: 'Bar',
    onChange: jest.fn(),
};

describe('Amount input component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Amount {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Amount value', () => {
        const wrapper = shallow(<Amount {...props} />);

        expect(wrapper.find('input').props().value).toEqual(1.5);
    });

    test('Amount monetary value', () => {
        const wrapper = shallow(<Amount {...props} />);

        expect(wrapper.find('p').text()).toEqual('= $ 1.50');
    });

    test('Amount change callback', () => {
        const wrapper = shallow(<Amount {...props} />);

        wrapper.find('input').simulate('change', { target: { value: '2' } });
        expect(props.onChange).toHaveBeenLastCalledWith('2000000');
    });

    test('Amount set max callback', () => {
        const wrapper = shallow(<Amount {...props} />);

        wrapper.find('a.checkbox').simulate('click');
        expect(props.onChange).toHaveBeenLastCalledWith('4000000');
    });

    test('Address label', () => {
        const wrapper = shallow(<Amount {...props} />);

        expect(wrapper.find('small').text()).toEqual('Foo');
    });
});
