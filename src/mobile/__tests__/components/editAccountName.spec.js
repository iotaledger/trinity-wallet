import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { EditAccountName } from '../../components/editAccountName';

jest.mock('react-native-device-info');

const getProps = overrides =>
    assign(
        {},
        {
            t: () => 'foo',
            seedIndex: 0,
            accountName: 'foo',
            saveAccountName: noop,
            backPress: noop,
            textColor: { color: 'white' },
            secondaryBackgroundColor: 'white',
            arrowLeftImagePath: 20,
            tickImagePath: 21,
            negativeColor: 'white',
        },
        overrides,
    );

describe('Testing EditAccountName component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(EditAccountName.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require an accountName string as a prop', () => {
            expect(EditAccountName.propTypes.accountName).toEqual(PropTypes.string.isRequired);
        });

        it('should require a saveAccountName function as a prop', () => {
            expect(EditAccountName.propTypes.saveAccountName).toEqual(PropTypes.func.isRequired);
        });

        it('should require a backPress function as a prop', () => {
            expect(EditAccountName.propTypes.backPress).toEqual(PropTypes.func.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(EditAccountName.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a secondaryBackgroundColor string as a prop', () => {
            expect(EditAccountName.propTypes.secondaryBackgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a arrowLeftImagePath number as a prop', () => {
            expect(EditAccountName.propTypes.arrowLeftImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a tickImagePath number as a prop', () => {
            expect(EditAccountName.propTypes.tickImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a negativeColor function as a prop', () => {
            expect(EditAccountName.propTypes.negativeColor).toEqual(PropTypes.string.isRequired);
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
                const textField = wrapper.find('CustomTextInput');
                textField.props().onSubmitEditing();
                expect(props.saveAccountName).toHaveBeenCalledWith('foo');
            });
        });
    });
});
