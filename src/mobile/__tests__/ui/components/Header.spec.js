import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import Header from 'ui/components/Header';

const getProps = (overrides) =>
    assign(
        {},
        {
            textColor: '#FFFFFF',
            children: 'foo',
        },
        overrides,
    );

describe('Testing Header component', () => {
    describe('propTypes', () => {
        it('should require a textColor string as a prop', () => {
            expect(Header.propTypes.textColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a children string as a prop', () => {
            expect(Header.propTypes.children).toEqual(PropTypes.string);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Header {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return children inside Text component', () => {
            const props = getProps();

            const wrapper = shallow(<Header {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .children()
                    .text(),
            ).toEqual('foo');
        });
    });
});
