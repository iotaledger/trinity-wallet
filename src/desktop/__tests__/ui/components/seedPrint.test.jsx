import React from 'react';
import { shallow } from 'enzyme';

import SeedPrint from 'ui/components/SeedPrint';

const props = {
    filled: false,
    seed: Array(81).fill(0),
    checksum: 'ABC',
};

describe('SeedPrint component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<SeedPrint {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Empty template', () => {
        const wrapper = shallow(<SeedPrint {...props} />);

        expect(wrapper.find('svg')).toHaveLength(0);
    });

    test('Filled template', () => {
        const mockProps = Object.assign(props, { filled: true });
        const wrapper = shallow(<SeedPrint {...mockProps} />);

        expect(wrapper.find('path')).toHaveLength(mockProps.seed.length + mockProps.checksum.length);
    });
});
