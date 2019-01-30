import React from 'react';
import { shallow } from 'enzyme';

import { PasswordComponent as Password } from 'ui/components/input/Password';

const props = {
    value: 'LoremIpsumDolorSitAmet',
    label: 'Bar',
    showScore: true,
    onChange: jest.fn(),
    t: (str) => str,
};

describe('Password component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Password {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Input value', () => {
        const wrapper = shallow(<Password {...props} />);

        expect(wrapper.find('input').props().value).toEqual('LoremIpsumDolorSitAmet');
    });

    test('Input change callback', () => {
        const wrapper = shallow(<Password {...props} />);

        wrapper.find('input').simulate('change', { target: { value: 'FooBar' } });
        expect(props.onChange).toHaveBeenLastCalledWith('FooBar');
    });

    test('Password score display', () => {
        const testValues = ['Foo', 'FooBar', 'FooBarBaz', 'FooBarBazF', 'FooBarBazFizz'];

        testValues.forEach((testValue, index) => {
            const wrapper = shallow(<Password {...props} value={testValue} />);
            expect(wrapper.find('div.score').props()['data-strength']).toEqual(index);
        });
    });

    test('Password valid input display', () => {
        const validProps = [
            {
                value: 'FooBarBazFizz',
            },
            {
                value: 'FooBarBazFizz',
                match: 'FooBarBazFizz',
            },
        ];

        const invalidProps = [
            {
                value: 'FooBar',
            },
            {
                value: 'FooBar',
                match: 'FooBar',
            },
            {
                value: 'FooBarBazFizz',
                match: 'FooBarBazFuzz',
            },
        ];

        validProps.forEach((testProps) => {
            const wrapper = shallow(<Password {...props} {...testProps} showValid />);
            expect(wrapper.find('.isValid')).toHaveLength(1);
        });

        invalidProps.forEach((testProps) => {
            const wrapper = shallow(<Password {...props} {...testProps} showValid />);
            expect(wrapper.find('.isValid')).toHaveLength(0);
        });
    });

    test('Input label', () => {
        const wrapper = shallow(<Password {...props} />);

        expect(wrapper.find('small').text()).toEqual('Bar');
    });

    test('Input disabled state', () => {
        const mockProps = Object.assign({}, props, { disabled: true });
        const wrapper = shallow(<Password {...mockProps} />);

        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });
});
