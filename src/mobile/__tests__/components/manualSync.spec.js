import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import ManualSync from '../../components/manualSync';

const getProps = overrides =>
    assign(
        {},
        {
            isSyncing: false,
            backPress: noop,
            onManualSyncPress: noop,
            t: arg => {
                const translations = {
                    'manualSync:youMayNotice': 'You may notice your device slowing down.',
                    'manualSync:thisMayTake': 'This may take a while.',
                    'manualSync:syncingYourAccount': 'Syncing your account.',
                    'manualSync:syncAccount': 'SYNC ACCOUNT',
                    'manualSync:pressToSync': 'Press the button below to sync your account.',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
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

        it('should require a arrowLeftImagePath number as a prop', () => {
            expect(ManualSync.propTypes.arrowLeftImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a negativeColor string as a prop', () => {
            expect(ManualSync.propTypes.negativeColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a borderColor object as a prop', () => {
            expect(ManualSync.propTypes.borderColor).toEqual(PropTypes.object.isRequired);
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

        describe('when prop isSyncing is false', () => {
            it('should return a Text component with child as "Press the button below to sync your account."', () => {
                const props = getProps();

                const wrapper = shallow(<ManualSync {...props} />);
                expect(
                    wrapper
                        .find('Text')
                        .first()
                        .children()
                        .text(),
                ).toBe('Press the button below to sync your account.');
            });

            it('should return a Text component with child as "This may take a while."', () => {
                const props = getProps();

                const wrapper = shallow(<ManualSync {...props} />);
                expect(
                    wrapper
                        .find('Text')
                        .at(1)
                        .children()
                        .text(),
                ).toBe('This may take a while.');
            });

            it('should return a Text component with child as "You may notice your device slowing down."', () => {
                const props = getProps();

                const wrapper = shallow(<ManualSync {...props} />);
                expect(
                    wrapper
                        .find('Text')
                        .at(2)
                        .children()
                        .text(),
                ).toBe('You may notice your device slowing down.');
            });

            it('should return a Text component with child as "SYNC ACCOUNT"', () => {
                const props = getProps();

                const wrapper = shallow(<ManualSync {...props} />);
                expect(
                    wrapper
                        .find('Text')
                        .at(3)
                        .children()
                        .text(),
                ).toBe('SYNC ACCOUNT');
            });

            it('should call prop method onManualSyncPress when first TouchableOpacityElement is onPress is triggered', () => {
                const props = getProps({
                    onManualSyncPress: jest.fn(),
                });

                const wrapper = shallow(<ManualSync {...props} />);
                const lastTouchableOpacity = wrapper.find('TouchableOpacity').first();
                lastTouchableOpacity.props().onPress();
                expect(props.onManualSyncPress).toHaveBeenCalled();
            });

            it('should call prop method backPress when last TouchableOpacityElement is onPress is triggered', () => {
                const props = getProps({
                    backPress: jest.fn(),
                });

                const wrapper = shallow(<ManualSync {...props} />);
                const lastTouchableOpacity = wrapper.find('TouchableOpacity').last();
                lastTouchableOpacity.props().onPress();
                expect(props.backPress).toHaveBeenCalled();
            });
        });

        describe('when prop isSyncing is true', () => {
            it('should return a Text component with child as "Syncing your account."', () => {
                const props = getProps({ isSyncing: true });

                const wrapper = shallow(<ManualSync {...props} />);
                expect(
                    wrapper
                        .find('Text')
                        .first()
                        .children()
                        .text(),
                ).toBe('Syncing your account.');
            });

            it('should return a Text component with child as "This may take a while."', () => {
                const props = getProps({ isSyncing: true });

                const wrapper = shallow(<ManualSync {...props} />);
                expect(
                    wrapper
                        .find('Text')
                        .at(1)
                        .children()
                        .text(),
                ).toBe('This may take a while.');
            });

            it('should return a Text component with child as "You may notice your device slowing down."', () => {
                const props = getProps({ isSyncing: true });

                const wrapper = shallow(<ManualSync {...props} />);
                expect(
                    wrapper
                        .find('Text')
                        .at(2)
                        .children()
                        .text(),
                ).toBe('You may notice your device slowing down.');
            });

            it('should return ActivityIndicator component', () => {
                const props = getProps();

                const wrapper = shallow(<ManualSync {...props} />);
                expect(wrapper.find('ActivityIndicator').length).toBe(0);

                wrapper.setProps({ isSyncing: true });
                expect(wrapper.find('ActivityIndicator').length).toBe(1);
            });
        });
    });
});
