import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import InfoBox from '../../components/InfoBox';

const getProps = (overrides) =>
    assign(
        {},
        {
            body: {},
            text: 'foo',
        },
        overrides,
    );

describe('Testing InfoBox component', () => {
    describe('propTypes', () => {
        it('should require a body object as a prop', () => {
            expect(InfoBox.propTypes.body).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<InfoBox {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return an "Image" component', () => {
            const props = getProps();

            const wrapper = shallow(<InfoBox {...props} />);
            expect(wrapper.find('Image').length).toEqual(1);
        });

        it('should return "text" prop as a child to last View component', () => {
            const props = getProps();

            const wrapper = shallow(<InfoBox {...props} />);
            expect(
                wrapper
                    .find('View')
                    .last()
                    .children()
                    .text(),
            ).toEqual('foo');
        });
    });
});
