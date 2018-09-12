import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { TextInput } from 'react-native';
import ProgressBar from 'ui/components/ProgressBar';

const getProps = (overrides) =>
    assign(
        {},
        {
            progress: 0,
            children: <TextInput />,
            textColor: '#ffffff',
        },
        overrides,
    );

describe('Testing ProgressBar component', () => {
    describe('propTypes', () => {
        it('should require a progress number as a prop', () => {
            expect(ProgressBar.propTypes.progress).toEqual(PropTypes.number.isRequired);
        });

        it('should accept a children node as a prop', () => {
            expect(ProgressBar.propTypes.children).toEqual(PropTypes.node);
        });

        it('should accept a color string as a prop', () => {
            expect(ProgressBar.propTypes.color).toEqual(PropTypes.string);
        });

        it('should accept an indeterminate bool as a prop', () => {
            expect(ProgressBar.propTypes.indeterminate).toEqual(PropTypes.bool);
        });

        it('should accept an animationType string as a prop', () => {
            expect(ProgressBar.propTypes.animationType).toEqual(PropTypes.string);
        });

        it('should accept a width number as a prop', () => {
            expect(ProgressBar.propTypes.width).toEqual(PropTypes.number);
        });

        it('should accept a height number as a prop', () => {
            expect(ProgressBar.propTypes.height).toEqual(PropTypes.number);
        });

        it('should accept a textColor string as a prop', () => {
            expect(ProgressBar.propTypes.textColor).toEqual(PropTypes.string);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<ProgressBar {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return children props as a direct child of Text component', () => {
            const props = getProps();

            const wrapper = shallow(<ProgressBar {...props} />);
            const text = wrapper
                .children()
                .at(0)
                .childAt(0);
            expect(text.children().type()).toEqual(TextInput);
        });
    });
});
