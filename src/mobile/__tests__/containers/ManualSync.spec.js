import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import ManualSync from '../../containers/ManualSync';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            isSyncing: false,
            backPress: noop,
            onManualSyncPress: noop,
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
            textColor: { color: 'white' },
            body: { color: 'white' },
            primary: { color: 'black' },
        },
        overrides,
    );

describe('Testing ManualSync component', () => {
    describe('propTypes', () => {
        it('should require a isSyncing boolean as a prop', () => {
            expect(ManualSync.propTypes.isSyncing).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a backPress function as a prop', () => {
            expect(ManualSync.propTypes.backPress).toEqual(PropTypes.func.isRequired);
        });

        it('should require a onManualSyncPress function as a prop', () => {
            expect(ManualSync.propTypes.onManualSyncPress).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(ManualSync.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(ManualSync.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a primary object as a prop', () => {
            expect(ManualSync.propTypes.primary).toEqual(PropTypes.object.isRequired);
        });

        it('should require a body object as a prop', () => {
            expect(ManualSync.propTypes.body).toEqual(PropTypes.object.isRequired);
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
