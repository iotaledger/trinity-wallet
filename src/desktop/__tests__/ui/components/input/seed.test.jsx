import React from 'react';
import { shallow } from 'enzyme';

import { SeedComponent as Seed } from 'ui/components/input/Seed';

const props = {
    seed: [0, 1, 2],
    label: 'Foo',
    closeLabel: 'Bar',
    onChange: jest.fn(),
    setAccountInfoDuringSetup: () => {},
    updateImportName: false,
    generateAlert: () => {},
    t: (str) => str,
};

global.Electron = {
    getChecksum: () => 'XXX',
};

describe('Seed input component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Seed {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Input value', () => {
        const wrapper = shallow(<Seed {...props} />);

        expect(wrapper.find('.letter')).toHaveLength(3);
    });

    test('Input change callback', () => {
        const wrapper = shallow(<Seed {...props} />);

        wrapper.find('[contentEditable]').simulate('keyDown', { preventDefault: () => {}, key: 'a', keyCode: 97 });
        expect(props.onChange).toHaveBeenLastCalledWith([0, 1, 2, 1]);
    });

    test('Checksum display', () => {
        const testValues = [Array(20).fill(1), Array(81).fill(1), Array(90).fill(1)];
        const testChecksums = ['< 81', 'XXX', '> 81'];

        testValues.forEach((testValue, index) => {
            const wrapper = shallow(<Seed {...props} seed={testValue} />);
            expect(wrapper.find('.info').text()).toEqual(testChecksums[index]);
        });
    });

    test('Input label', () => {
        const wrapper = shallow(<Seed {...props} />);

        expect(wrapper.find('small').text()).toEqual('Foo');
    });
});
