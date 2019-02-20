import assign from 'lodash/assign';
import get from 'lodash/get';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { EditAccountName } from 'ui/views/wallet/EditAccountName';
import translations from 'shared-modules/locales/en/translation';
import theme from '../../../../__mocks__/theme';

jest.mock('react-native-device-info');
jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));
jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            selectedAccountName: 'Main',
            selectedAccountMeta: { type: 'keychain' },
            accountNames: ['Main'],
            t: (args) => get(translations, args.split(':')) || '',
            setSetting: noop,
            generateAlert: noop,
            changeAccountName: noop,
            theme,
            selectedAccountType: 'keychain',
            isAutoPromoting: false,
            shouldPreventAction: false,
        },
        overrides,
    );

describe('Testing EditAccountName component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(EditAccountName.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a selectedAccountName string as a prop', () => {
            expect(EditAccountName.propTypes.selectedAccountName).toEqual(PropTypes.string.isRequired);
        });

        it('should require a selectedAccountMeta object as a prop', () => {
            expect(EditAccountName.propTypes.selectedAccountMeta).toEqual(PropTypes.object.isRequired);
        });

        it('should require an accountNames array as a prop', () => {
            expect(EditAccountName.propTypes.accountNames).toEqual(PropTypes.array.isRequired);
        });

        it('should require an accountNames array as a prop', () => {
            expect(EditAccountName.propTypes.accountNames).toEqual(PropTypes.array.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(EditAccountName.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a setSetting function as a prop', () => {
            expect(EditAccountName.propTypes.setSetting).toEqual(PropTypes.func.isRequired);
        });

        it('should require a changeAccountName function as a prop', () => {
            expect(EditAccountName.propTypes.changeAccountName).toEqual(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(EditAccountName.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a isAutoPromoting boolean as a prop', () => {
            expect(EditAccountName.propTypes.isAutoPromoting).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a shouldPreventAction boolean as a prop', () => {
            expect(EditAccountName.propTypes.shouldPreventAction).toEqual(PropTypes.bool.isRequired);
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
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#save', () => {
                describe('when accountName (param) is unique', () => {
                    describe('when isAutoPromoting prop is true', () => {
                        it('should call prop method generateAlert', () => {
                            const props = getProps({
                                isAutoPromoting: true,
                                generateAlert: jest.fn(),
                            });

                            const wrapper = shallow(<EditAccountName {...props} />);
                            const instance = wrapper.instance();

                            instance.save();
                            expect(props.generateAlert).toHaveBeenCalledWith(
                                'error',
                                'Please wait',
                                'Trinity is performing another function. Please wait and try again.',
                            );
                        });
                    });

                    describe('when shouldPreventAction prop is true', () => {
                        it('should call prop method generateAlert', () => {
                            const props = getProps({
                                shouldPreventAction: true,
                                generateAlert: jest.fn(),
                            });

                            const wrapper = shallow(<EditAccountName {...props} />);
                            const instance = wrapper.instance();

                            instance.save();
                            expect(props.generateAlert).toHaveBeenCalledWith(
                                'error',
                                'Please wait',
                                'Trinity is performing another function. Please wait and try again.',
                            );
                        });
                    });
                });
            });
        });
    });
});
