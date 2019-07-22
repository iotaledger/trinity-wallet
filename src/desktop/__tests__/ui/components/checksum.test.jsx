import React from 'react';
import { shallow } from 'enzyme';

import Checksum from 'ui/components/Checksum';

const props = {
    address: 'ABCDEFGHIJKLMOPRSTUCXYZ9ABCDEFGHIJKLMOPRSTUCXYZ9ABCDEFGHIJKLMOPRSTUCXYZ9ABCDEFGHIJKLMOPRST',
};

describe('Checksum component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Checksum {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Address value', () => {
        const wrapper = shallow(<Checksum {...props} />);

        expect(wrapper.text()).toEqual(
            'ABCDEFGHIJKLMOPRSTUCXYZ9ABCDEFGHIJKLMOPRSTUCXYZ9ABCDEFGHIJKLMOPRSTUCXYZ9ABCDEFGHIJKLMOPRST',
        );
    });

    test('Checksum highlight value', () => {
        const wrapper = shallow(<Checksum {...props} />);

        expect(wrapper.find('mark').text()).toEqual('JKLMOPRST');
    });
});
