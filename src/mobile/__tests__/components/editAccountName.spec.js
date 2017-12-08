import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import EditAccountName from '../../components/editAccountName';

jest.mock('react-native-device-info');

const getProps = overrides =>
    assign(
        {},
        {
            seedIndex: 0,
            accountName: 'foo',
            saveAccountName: noop,
            backPress: noop,
        },
        overrides,
    );

describe('Testing EditAccountName component', () => {
    describe('propTypes', () => {
        it('should require a seedIndex number as a prop', () => {
            expect(EditAccountName.propTypes.seedIndex).toBe(PropTypes.number.isRequired);
        });

        it('should require an accountName string as a prop', () => {
            expect(EditAccountName.propTypes.accountName).toBe(PropTypes.string.isRequired);
        });

        it('should require a saveAccountName function as a prop', () => {
            expect(EditAccountName.propTypes.saveAccountName).toBe(PropTypes.func.isRequired);
        });

        it('should require a backPress function as a prop', () => {
            expect(EditAccountName.propTypes.backPress).toBe(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        describe('initially', () => {
            it('should not explode', () => {
                const props = getProps();
                const wrapper = shallow(<EditAccountName {...props} />);
                expect(wrapper.name()).toBe('TouchableWithoutFeedback');
            });

            it('should return two TouchableOpacity components', () => {
                const props = getProps();
                const wrapper = shallow(<EditAccountName {...props} />);
                expect(wrapper.find('TouchableOpacity').length).toBe(2);
            });
        });

        describe('when onPress prop of second TouchableOpacity is triggered', () => {
            it('should call prop method saveAccountName with trimmed accountName state prop', () => {
                const props = getProps({
                    saveAccountName: jest.fn(),
                });

                const wrapper = shallow(<EditAccountName {...props} />);
                wrapper.setState({ accountName: 'foo   ' });
                const lastTouchableOpacity = wrapper.find('TouchableOpacity').last();
                lastTouchableOpacity.props().onPress();
                expect(props.saveAccountName).toHaveBeenCalledWith('foo');
            });
        });

        describe('when onSubmitEditing prop of second TextField component is triggered', () => {
            it('should call prop method saveAccountName with trimmed accountName state prop', () => {
                const props = getProps({
                    saveAccountName: jest.fn(),
                });

                const wrapper = shallow(<EditAccountName {...props} />);
                wrapper.setState({ accountName: 'foo   ' });
                const textField = wrapper.find('TextField');
                textField.props().onSubmitEditing();
                expect(props.saveAccountName).toHaveBeenCalledWith('foo');
            });
        });
    });
});
