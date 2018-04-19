import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import DynamicStatusBar from '../../components/DynamicStatusBar';

const getProps = (overrides) =>
    assign(
        {},
        {
            backgroundColor: '#ffffff',
            isModalActive: false
        },
        overrides,
    );

describe('Testing DynamicStatusBar component', () => {
    describe('propTypes', () => {
        it('should require a backgroundColor string as a prop', () => {
            expect(DynamicStatusBar.propTypes.backgroundColor).toEqual(PropTypes.string.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<DynamicStatusBar {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should pass "barStyle" prop to StatusBar component', () => {
            const props = getProps();

            const wrapper = shallow(<DynamicStatusBar {...props} />);

            expect('barStyle' in wrapper.childAt(0).props()).toEqual(true);
        });

        it('should pass "backgroundColor" prop to StatusBar component', () => {
            const props = getProps();

            const wrapper = shallow(<DynamicStatusBar {...props} />);

            expect('backgroundColor' in wrapper.childAt(0).props()).toEqual(true);
        });

        it('should pass "translucent" prop to StatusBar component', () => {
            const props = getProps();

            const wrapper = shallow(<DynamicStatusBar {...props} />);

            expect('translucent' in wrapper.childAt(0).props()).toEqual(true);
        });
    });
});
