import React from 'react';
import { shallow } from 'enzyme';

import Info from 'ui/components/Info';

const props = {
    children: 'Lorem ipsum',
};

describe('Info component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Info {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Info content', () => {
        const wrapper = shallow(<Info {...props} />);

        expect(wrapper.text()).toEqual('<Icon />Lorem ipsum');
    });
});
