import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { EditAccountName } from 'ui/views/wallet/EditAccountName';

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
            accountNames: ['Main'],
            t: () => 'foo',
            setSetting: noop,
            generateAlert: noop,
            changeAccountName: noop,
            theme: { body: {} },
            selectedAccountType: 'keychain',
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
});
