import React from 'react';
import { shallow } from 'enzyme';

import { AboutComponent as About } from 'ui/global/About';

const props = {
    t: (str) => str,
};

global.Electron = {
    onEvent: function(_event, e) {
        this.menuEvent = e;
    },
    removeEvent: () => {},
    menuEvent: null,
};

describe('About component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<About {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Set visible on menu event', () => {
        const wrapper = shallow(<About {...props} />);

        Electron.menuEvent('about');
        expect(wrapper.state('visible')).toBeTruthy();
    });
});
