import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import  { ManualSync } from '../../containers/ManualSync';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            isSyncing: false,
            shouldPreventAction: false,
            setSetting: noop,
            t: (arg) => {
                const translations = {
                    'manualSync:youMayNotice': 'You may notice your device slowing down.',
                    'manualSync:thisMayTake': 'This may take a while.',
                    'manualSync:syncingYourAccount': 'Syncing your account.',
                    'manualSync:syncAccount': 'SYNC ACCOUNT',
                    'manualSync:pressToSync': 'Press the button below to sync your account.',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
            theme: { body: {} },
            password: 'foo',
            selectedAccountName: 'MAIN ACCOUNT',
            generateAlert: noop,
            manuallySyncAccount: noop
        },
        overrides,
    );

describe('Testing ManualSync component', () => {
    describe('propTypes', () => {
        it('should require a isSyncing boolean as a prop', () => {
            expect(ManualSync.propTypes.isSyncing).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a shouldPreventAction boolean as a prop', () => {
            expect(ManualSync.propTypes.shouldPreventAction).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a setSetting function as a prop', () => {
            expect(ManualSync.propTypes.setSetting).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(ManualSync.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(ManualSync.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a password string as a prop', () => {
            expect(ManualSync.propTypes.password).toEqual(PropTypes.string.isRequired);
        });

        it('should require a selectedAccountName string as a prop', () => {
            expect(ManualSync.propTypes.selectedAccountName).toEqual(PropTypes.string.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(ManualSync.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a manuallySyncAccount function as a prop', () => {
            expect(ManualSync.propTypes.manuallySyncAccount).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        describe('initially', () => {
            it('should not explode', () => {
                const props = getProps();
                const wrapper = shallow(<ManualSync {...props} />);
                expect(wrapper.name()).toBe('View');
            });

            it('should return a View component as an immediate child', () => {
                const props = getProps();
                const wrapper = shallow(<ManualSync {...props} />);
                expect(wrapper.childAt(0).name()).toBe('View');
            });
        });
    });
});
