import React from 'react';
import { shallow } from 'enzyme';

import Titlebar from 'ui/global/Titlebar';

const props = {
    path: '/',
};

global.Electron = {
    getOS: () => 'win32',
};

describe('Titlebar component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Titlebar {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Render dark titlebar', () => {
        const wrapper = shallow(<Titlebar path="settings" />);

        expect(wrapper.find('.dark')).toHaveLength(1);
    });

    test('Render light titlebar', () => {
        const wrapper = shallow(<Titlebar path="onboarding" />);

        expect(wrapper.find('.light')).toHaveLength(1);
    });
});
