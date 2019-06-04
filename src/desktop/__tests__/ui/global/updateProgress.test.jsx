import React from 'react';
import { shallow } from 'enzyme';

import { UpdateProgressComponent as UpdateProgress } from 'ui/global/UpdateProgress';

const props = {
    t: (str) => str,
};

global.Electron = {
    onEvent: () => {},
};

describe('UpdateProgress component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<UpdateProgress {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Render Progress component', () => {
        const wrapper = shallow(<UpdateProgress {...props} />);

        wrapper.setState({
            progress: {
                percent: 50,
                transferred: 100,
                total: 200,
            },
        });

        expect(wrapper.find('Progress')).toHaveLength(1);
    });
});
