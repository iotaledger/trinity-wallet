import React from 'react';
import { shallow } from 'enzyme';

import { SeedExportComponent as SeedExport } from 'ui/global/SeedExport';

const props = {
    seed: Array(81).fill(1),
    title: 'Foo',
    onClose: jest.fn(),
    t: (str) => str,
};

describe('SeedExport component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<SeedExport {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('First export step', () => {
        const wrapper = shallow(<SeedExport {...props} />);

        expect(wrapper.hasClass('step1')).toBeTruthy();
    });

    test('Second export step', () => {
        const wrapper = shallow(<SeedExport {...props} />);

        wrapper.setState({ step: 2 });
        expect(wrapper.hasClass('step2')).toBeTruthy();
    });
});
