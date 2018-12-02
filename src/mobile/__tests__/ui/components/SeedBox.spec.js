import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import SeedBox from 'ui/components/SeedBox';

const getProps = (overrides) =>
    assign(
        {},
        {
            seed: '9'.repeat(81),
            bodyColor: '#ffffff',
            textColor: {},
            borderColor: {},
        },
        overrides,
    );

describe('Testing SeedBox component', () => {
    describe('propTypes', () => {
        it('should require a seed string as a prop', () => {
            expect(SeedBox.propTypes.seed).toEqual(PropTypes.string.isRequired);
        });

        it('should require a bodyColor string as a prop', () => {
            expect(SeedBox.propTypes.bodyColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(SeedBox.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a borderColor object as a prop', () => {
            expect(SeedBox.propTypes.borderColor).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<SeedBox {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return 27 TextWithLetterSpacing components', () => {
            const props = getProps();

            const wrapper = shallow(<SeedBox {...props} />);
            const textWithLetterSpacing = wrapper.find('TextWithLetterSpacing');

            expect(textWithLetterSpacing.length).toEqual(27);
        });

        it('should always return three characters substring as children to each TextWithLetterSpacing component', () => {
            const props = getProps();

            const wrapper = shallow(<SeedBox {...props} />);
            const textWithLetterSpacing = wrapper.find('TextWithLetterSpacing');

            textWithLetterSpacing.forEach((el) => expect(el.children().text().length).toEqual(3));
        });
    });
});
