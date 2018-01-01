import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { Dropdown } from '../../components/dropdown';

const getProps = overrides =>
    assign(
        {},
        {
            barColor: 'foo',
            backgroundColor: 'white',
            negativeColor: 'black',
            onRef: noop,
            options: [],
        },
        overrides,
    );

describe('Testing Dropdown component', () => {
    describe('propTypes', () => {
        it('should accept an onRef function as a prop', () => {
            expect(Dropdown.propTypes.onRef).toBe(PropTypes.func);
        });
    });

    describe('when mounts', () => {
        describe('when onRef prop is defined', () => {
            it('should call onRef with instance', () => {
                const props = getProps({
                    onRef: jest.fn(),
                });
                const wrapper = shallow(<Dropdown {...props} />);
                const instance = wrapper.instance();

                expect(props.onRef).toHaveBeenCalledWith(instance);
            });
        });
    });

    describe('when unmounts', () => {
        describe('when onRef prop is defined', () => {
            it('should call onRef with null', () => {
                const props = getProps({
                    onRef: jest.fn(),
                });
                const wrapper = shallow(<Dropdown {...props} />);
                wrapper.unmount();

                expect(props.onRef).toHaveBeenCalledWith(null);
            });
        });
    });
});
