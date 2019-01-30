import React from 'react';
import { shallow } from 'enzyme';

import { ErrorLogComponent as ErrorLog } from 'ui/global/ErrorLog';

const props = {
    log: Array(10).fill({
        date: 1548842449,
        error: 'Foo',
    }),
    clearLog: jest.fn(),
    t: (str) => str,
};

global.Electron = {
    onEvent: function(_event, e) {
        this.menuEvent = e;
    },
    removeEvent: () => {},
    menuEvent: null,
};

describe('ErrorLog component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<ErrorLog {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Render error entries', () => {
        const wrapper = shallow(<ErrorLog {...props} />);

        expect(wrapper.find('li')).toHaveLength(10);
    });

    test('Set visible on menu event', () => {
        const wrapper = shallow(<ErrorLog {...props} />);

        Electron.menuEvent('errorlog');
        expect(wrapper.state('visible')).toBeTruthy();
    });
});
