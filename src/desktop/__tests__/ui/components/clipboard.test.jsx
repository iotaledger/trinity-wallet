import React from 'react';
import { shallow } from 'enzyme';

import { ClipboardComponent as Clipboard } from 'ui/components/Clipboard';

const props = {
    text: 'Lorem ipsum',
    title: 'Foo',
    success: 'Bar',
    generateAlert: jest.fn(),
};

global.Electron = {
    clipboard: jest.fn(),
};

describe('Clipboard component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Clipboard {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Text content', () => {
        const wrapper = shallow(<Clipboard {...props} />);

        expect(wrapper.text()).toEqual('Lorem ipsum');
    });

    test('Custom content', () => {
        const mockProps = Object.assign(props, { children: 'Fizz Buzz' });
        const wrapper = shallow(<Clipboard {...mockProps} />);

        expect(wrapper.text()).toEqual('Fizz Buzz');
    });

    test('Copy to clipboard event', () => {
        const wrapper = shallow(<Clipboard {...props} />);

        wrapper.simulate('click');

        expect(props.generateAlert).toHaveBeenCalledTimes(1);
        expect(Electron.clipboard).toHaveBeenCalledTimes(1);
    });
});
