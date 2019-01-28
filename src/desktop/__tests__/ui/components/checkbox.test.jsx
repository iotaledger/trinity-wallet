import React from 'react';
import { shallow } from 'enzyme';

import Checkbox from 'ui/components/Checkbox';

const props = {
    checked: false,
    label: 'Foo',
    onChange: jest.fn(),
};

describe('Checkbox component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Unchecked state', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        expect(wrapper.hasClass('on')).toBeFalsy();
    });

    test('Checked state', () => {
        const mockProps = Object.assign(props, { checked: true });
        const wrapper = shallow(<Checkbox {...mockProps} />);

        expect(wrapper.hasClass('on')).toBeTruthy();
    });

    test('Checkbox toggle event', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        wrapper.simulate('click');
        expect(props.onChange).toHaveBeenCalledTimes(1);
    });

    test('Checkbox label', () => {
        const wrapper = shallow(<Checkbox {...props} />);

        expect(wrapper.text()).toEqual('Foo');
    });

    test('Disabled state', () => {
        const mockProps = Object.assign(props, { disabled: true });
        const wrapper = shallow(<Checkbox {...mockProps} />);

        expect(wrapper.hasClass('disabled')).toBeTruthy();
    });
});
