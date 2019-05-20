import React from 'react';
import { shallow } from 'enzyme';

import { AlertsComponent as Alerts } from 'ui/global/Alerts';

const props = {
    dismissAlert: jest.fn(),
    alerts: {
        title: 'Foo',
        message: 'Bar',
        category: 'Baz',
    },
    forceUpdate: false,
    shouldUpdate: false,
    displayTestWarning: false,
    t: (str) => str,
};

global.Electron = {
    getOS: () => {},
};

describe('Alerts component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Alerts {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Alerts visible', () => {
        const wrapper = shallow(<Alerts {...props} />);

        expect(wrapper.find('.visible')).toHaveLength(1);
    });

    test('Alerts hidden', () => {
        const mockProps = Object.assign({}, props, {
            alerts: {
                title: '',
                message: '',
                category: '',
            },
        });
        const wrapper = shallow(<Alerts {...mockProps} />);

        expect(wrapper.find('.visible')).toHaveLength(0);
    });

    test('Display mandatory update', () => {
        const mockProps = Object.assign({}, props, { forceUpdate: true });
        const wrapper = shallow(<Alerts {...mockProps} />);

        expect(wrapper.find('.update')).toHaveLength(1);
        expect(wrapper.find('strong').text()).toEqual('global:forceUpdate');
    });

    test('Display optional update', () => {
        const mockProps = Object.assign({}, props, { shouldUpdate: true });
        const wrapper = shallow(<Alerts {...mockProps} />);

        expect(wrapper.find('.update')).toHaveLength(1);
        expect(wrapper.find('strong').text()).toEqual('global:shouldUpdate');
    });
});
