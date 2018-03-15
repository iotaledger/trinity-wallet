import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { MainSettings } from '../../containers/MainSettings';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            currency: 'USD',
            theme: 'general',
            mode: 'standard',
            themeName: 'custom',
            onModePress: noop,
            onLanguagePress: noop,
            setSetting: noop,
            setModalContent: noop,
            onThemePress: noop,
            t: (arg) => arg,
            borderBottomColor: { borderColor: 'white' },
            textColor: { color: 'white' },
            secondaryBackgroundColor: 'white',
        },
        overrides,
    );

describe('Testing MainSettings component', () => {
    describe('propTypes', () => {
        it('should require a currency string as a prop', () => {
            expect(MainSettings.propTypes.currency).toBe(PropTypes.string.isRequired);
        });

        it('should require a mode string as a prop', () => {
            expect(MainSettings.propTypes.mode).toBe(PropTypes.string.isRequired);
        });

        it('should require a onModePress function as a prop', () => {
            expect(MainSettings.propTypes.onModePress).toBe(PropTypes.func.isRequired);
        });

        it('should require a onLanguagePress function as a prop', () => {
            expect(MainSettings.propTypes.onLanguagePress).toBe(PropTypes.func.isRequired);
        });

        it('should require a setSetting function as a prop', () => {
            expect(MainSettings.propTypes.setSetting).toBe(PropTypes.func.isRequired);
        });

        it('should require a setModalContent function as a prop', () => {
            expect(MainSettings.propTypes.setModalContent).toBe(PropTypes.func.isRequired);
        });

        it('should require a onThemePress function as a prop', () => {
            expect(MainSettings.propTypes.onThemePress).toBe(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(MainSettings.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a borderBottomColor object as a prop', () => {
            expect(MainSettings.propTypes.borderBottomColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(MainSettings.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        describe('initially', () => {
            it('should not explode', () => {
                const props = getProps();
                const wrapper = shallow(<MainSettings {...props} />);
                expect(wrapper.name()).toBe('View');
            });

            it('should return a View component as an immediate child', () => {
                const props = getProps();
                const wrapper = shallow(<MainSettings {...props} />);
                expect(wrapper.childAt(0).name()).toBe('View');
            });

            it('should return nine TouchableOpacity components', () => {
                const props = getProps();
                const wrapper = shallow(<MainSettings {...props} />);
                expect(wrapper.find('TouchableOpacity').length).toBe(9);
            });
        });

        [
            { func: 'onModePress', calledWith: null },
            { func: 'onThemePress', calledWith: null },
            { func: 'setSetting', calledWith: 'currencySelection' },
            { func: 'onLanguagePress', calledWith: null },
            { func: 'setSetting', calledWith: 'accountManagement' },
            { func: 'setSetting', calledWith: 'changePassword' },
            { func: 'setSetting', calledWith: 'securitySettings' },
            { func: 'setSetting', calledWith: 'advancedSettings' },
            { func: 'setModalContent', calledWith: 'logoutConfirmation' },
        ].forEach((item, idx) => {
            describe(`when TouchableOpacity component prop onPress on index ${idx + 1} is triggered`, () => {
                it(`should call prop method ${item.func}`, () => {
                    const props = getProps({
                        [item.func]: jest.fn(),
                    });

                    const wrapper = shallow(<MainSettings {...props} />);
                    wrapper
                        .find('TouchableOpacity')
                        .at(idx)
                        .props()
                        .onPress();

                    if (item.calledWith) {
                        expect(props[item.func]).toHaveBeenCalledWith(item.calledWith);
                    } else {
                        expect(props[item.func]).toHaveBeenCalled();
                    }
                });
            });
        });
    });
});
