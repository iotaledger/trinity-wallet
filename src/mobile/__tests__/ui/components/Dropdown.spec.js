import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { Dropdown } from 'ui/components/Dropdown';
import theme from '../../../__mocks__/theme';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            theme,
            onRef: noop,
            options: [],
            disableWhen: false,
        },
        overrides,
    );

describe('Testing Dropdown component', () => {
    describe('propTypes', () => {
        it('should accept an onRef function as a prop', () => {
            expect(Dropdown.propTypes.onRef).toBe(PropTypes.func);
        });

        it('should accept a disableWhen boolean as a prop', () => {
            expect(Dropdown.propTypes.disableWhen).toBe(PropTypes.bool);
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

    describe('when onPress prop on TouchableWithoutFeedback is triggered', () => {
        beforeEach(() => {
            jest.mock('LayoutAnimation');
        });

        describe('when disableWhen prop is false', () => {
            it('should call instance method onDropdownTitlePress', () => {
                const props = getProps();
                const wrapper = shallow(<Dropdown {...props} />);
                const instance = wrapper.instance();

                jest.spyOn(instance, 'onDropdownTitlePress');
                wrapper
                    .find('TouchableWithoutFeedback')
                    .props()
                    .onPress();

                expect(instance.onDropdownTitlePress).toHaveBeenCalled();
            });
        });

        describe('when disableWhen prop is true', () => {
            it('should not call instance method onDropdownTitlePress', () => {
                const props = getProps({ disableWhen: true });
                const wrapper = shallow(<Dropdown {...props} />);
                const instance = wrapper.instance();

                jest.spyOn(instance, 'onDropdownTitlePress');
                wrapper
                    .find('TouchableWithoutFeedback')
                    .props()
                    .onPress();

                expect(instance.onDropdownTitlePress).toHaveBeenCalledTimes(0);
            });
        });
    });
});
