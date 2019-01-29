import React from 'react';
import { shallow } from 'enzyme';

import Tooltip from 'ui/components/Tooltip';

const props = {
    tip: 'Lorem ipsum',
    title: 'Dolor sit amet',
};

describe('Tooltip component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Tooltip {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Render with tip', () => {
        const wrapper = shallow(<Tooltip {...props} />);
        const titleEl = wrapper.find('em');

        expect(titleEl.text()).toEqual(props.tip);
    });

    test('Render with title', () => {
        const wrapper = shallow(<Tooltip {...props} />);
        const titleEl = wrapper.find('strong');

        expect(titleEl.text()).toEqual(props.title);
    });

    test('Render without title', () => {
        const mockProps = Object.assign(props, { title: null });
        const wrapper = shallow(<Tooltip {...mockProps} />);

        expect(wrapper.find('strong')).toHaveLength(0);
    });
});
