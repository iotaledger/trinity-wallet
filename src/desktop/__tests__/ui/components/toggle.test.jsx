import React from 'react';
import { shallow } from 'enzyme';

import Toggle from 'ui/components/Toggle';

const props = {
    checked: false,
    on: 'On',
    off: 'Off',
    onChange: jest.fn(),
};

describe('Toggle component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Toggle {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Off state', () => {
        const wrapper = shallow(<Toggle {...props} />);

        expect(wrapper.find('div div').hasClass('on')).toBeFalsy();
    });

    test('On state', () => {
        const mockProps = Object.assign({}, props, { checked: true });
        const wrapper = shallow(<Toggle {...mockProps} />);

        expect(wrapper.find('div div').hasClass('on')).toBeTruthy();
    });

    test('Toggle event', () => {
        const wrapper = shallow(<Toggle {...props} />);

        wrapper.simulate('click');
        expect(props.onChange).toHaveBeenCalledTimes(1);
    });
});
