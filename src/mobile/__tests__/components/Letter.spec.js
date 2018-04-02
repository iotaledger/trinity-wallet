import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { Letter } from '../../components/Letter';

const getProps = (overrides) =>
    assign(
        {},
        {
            children: 'foo',
            spacing: 1,
        },
        overrides,
    );

describe('Testing Letter component', () => {
    describe('propTypes', () => {
        it('should require a children string as a prop', () => {
            expect(Letter.propTypes.children).toEqual(PropTypes.string.isRequired);
        });

        it('should require a spacing number as a prop', () => {
            expect(Letter.propTypes.spacing).toEqual(PropTypes.number.isRequired);
        });

        it('should accept a textStyle array as a prop', () => {
            expect(Letter.propTypes.textStyle).toEqual(PropTypes.array);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Letter {...props} />);
            expect(wrapper.name()).toEqual('Text');
        });

        it('should return children prop as a child for Text', () => {
            const props = getProps();

            const wrapper = shallow(<Letter {...props} />);
            expect(wrapper.children().text()).toEqual('foo');
        });
    });
});
