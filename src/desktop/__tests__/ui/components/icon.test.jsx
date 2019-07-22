import React from 'react';
import { shallow } from 'enzyme';

import Icon from 'ui/components/Icon';

const props = {
    icon: 'iota',
    size: 32,
    color: '#ff0000',
};

describe('Icon component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Render svg element', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper.text()).toEqual('💥');
    });

    test('Icon size', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper.props().style.fontSize).toEqual(32);
        expect(wrapper.props().style.lineHeight).toEqual('32px');
    });

    test('Icon color', () => {
        const wrapper = shallow(<Icon {...props} />);

        expect(wrapper.props().style.color).toEqual('#ff0000');
    });
});
