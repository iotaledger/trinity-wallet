import React from 'react';
import { shallow } from 'enzyme';

import Progress from 'ui/components/Progress';

const props = {
    progress: 45,
    title: 'Dolor sit amet',
    subtitle: 'Lorem ipsum',
    type: 'large',
};

describe('Progress component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Progress {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Correct progress', () => {
        const wrapper = shallow(<Progress {...props} />);

        expect(
            wrapper
                .find('.bar')
                .first()
                .props().style.width,
        ).toEqual(`${props.progress}%`);
    });

    test('With title', () => {
        const wrapper = shallow(<Progress {...props} />);
        const titleEl = wrapper.find('p');

        expect(titleEl).toHaveLength(1);
        expect(titleEl.text()).toEqual(props.title);
    });

    test('Without title', () => {
        const mockProps = Object.assign(props, { title: null });
        const wrapper = shallow(<Progress {...mockProps} />);

        expect(wrapper.find('p')).toHaveLength(0);
    });

    test('With subtitle', () => {
        const wrapper = shallow(<Progress {...props} />);
        const titleEl = wrapper.find('small');

        expect(titleEl).toHaveLength(1);
        expect(titleEl.text()).toEqual(props.subtitle);
    });

    test('Without subtitle', () => {
        const mockProps = Object.assign(props, { subtitle: null });
        const wrapper = shallow(<Progress {...mockProps} />);

        expect(wrapper.find('small')).toHaveLength(0);
    });
});
