import React from 'react';
import { shallow } from 'enzyme';

import QR from 'ui/components/QR';

const props = {
    data: 'IOTA',
};

describe('QR component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<QR {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Render QR code', () => {
        const wrapper = shallow(<QR {...props} />);

        expect(wrapper.find('rect')).toHaveLength(441);
    });
});
