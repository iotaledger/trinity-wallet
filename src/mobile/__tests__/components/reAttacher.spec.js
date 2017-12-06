import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import Reattacher from '../../components/reAttacher';

const getProps = overrides =>
    assign(
        {},
        {
            attachments: [],
            attach: noop,
        },
        overrides,
    );

describe('Testing reAttacher component', () => {
    describe('when renders', () => {
        it('should return null', () => {
            const props = getProps();
            const wrapper = shallow(<Reattacher {...props} />);
            expect(wrapper.type()).toBe(null);
        });
    });
});
