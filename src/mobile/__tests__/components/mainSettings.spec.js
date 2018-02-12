import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import MainSettings from '../../components/mainSettings';

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
            themeImagePath: 0,
            advancedImagePath: 1,
            logoutImagePath: 2,
            passwordImagePath: 11,
            twoFactorAuthImagePath: 12,
            accountImagePath: 21,
            languageImagePath: 23,
            currencyImagePath: 22,
            modeImagePath: 40,
            borderBottomColor: { borderColor: 'white' },
            textColor: { color: 'white' },
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

        it('should require a themeImagePath number as a prop', () => {
            expect(MainSettings.propTypes.themeImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a advancedImagePath number as a prop', () => {
            expect(MainSettings.propTypes.advancedImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a logoutImagePath number as a prop', () => {
            expect(MainSettings.propTypes.logoutImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a passwordImagePath number as a prop', () => {
            expect(MainSettings.propTypes.passwordImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a twoFactorAuthImagePath number as a prop', () => {
            expect(MainSettings.propTypes.twoFactorAuthImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a accountImagePath number as a prop', () => {
            expect(MainSettings.propTypes.accountImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a languageImagePath number as a prop', () => {
            expect(MainSettings.propTypes.languageImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a currencyImagePath number as a prop', () => {
            expect(MainSettings.propTypes.currencyImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a borderBottomColor object as a prop', () => {
            expect(MainSettings.propTypes.borderBottomColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(MainSettings.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a modeImagePath number as a prop', () => {
            expect(MainSettings.propTypes.modeImagePath).toEqual(PropTypes.number.isRequired);
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
