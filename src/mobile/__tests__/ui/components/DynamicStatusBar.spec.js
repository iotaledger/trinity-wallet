import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import DynamicStatusBar from 'ui/components/DynamicStatusBar';

jest.mock('shared-modules/libs/utils', () => ({
    rgbToHex: jest.fn(() => '#000000'),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            backgroundColor: '#ffffff',
            isModalActive: false,
        },
        overrides,
    );

describe('Testing DynamicStatusBar component', () => {
    describe('propTypes', () => {
        it('should require a backgroundColor string as a prop', () => {
            expect(DynamicStatusBar.propTypes.backgroundColor).toEqual(PropTypes.string);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<DynamicStatusBar {...props} />);
            expect(wrapper.name()).toEqual('StatusBar');
        });

        it('should pass "backgroundColor" prop to StatusBar component', () => {
            const props = getProps();

            const wrapper = shallow(<DynamicStatusBar {...props} />);

            expect('backgroundColor' in wrapper.props()).toEqual(true);
        });

        it('should pass "translucent" prop to StatusBar component', () => {
            const props = getProps();

            const wrapper = shallow(<DynamicStatusBar {...props} />);

            expect('translucent' in wrapper.props()).toEqual(true);
        });
    });
});
