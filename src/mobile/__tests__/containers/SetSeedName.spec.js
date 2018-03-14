import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import PropTypes from 'prop-types';
import { SetSeedName } from '../../containers/SetSeedName';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            account: {
                onboardingComplete: false,
            },
            navigator: {
                push: noop,
            },
            setSeedName: noop,
            t: (arg) => {
                const translations = {
                    'global:mainWallet': 'MAIN ACCOUNT',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
            generateAlert: noop,
            setAdditionalAccountInfo: noop,
            seed: 'SEED',
            onboardingComplete: false,
            seedCount: 0,
            body: { color: 'red', bg: 'white' },
            theme: {},
            isTransitioning: false,
            isSendingTransfer: false,
            isGeneratingReceiveAddress: false,
            isFetchingAccountInfo: false,
            isSyncing: false,
        },
        overrides,
    );

describe('Testing SetSeedName component', () => {
    describe('propTypes', () => {
        it('should require a seed string as a prop', () => {
            expect(SetSeedName.propTypes.seed).toEqual(PropTypes.string.isRequired);
        });

        it('should require a onboardingComplete bool as a prop', () => {
            expect(SetSeedName.propTypes.onboardingComplete).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a seedCount number as a prop', () => {
            expect(SetSeedName.propTypes.seedCount).toEqual(PropTypes.number.isRequired);
        });

        it('should require a body object as a prop', () => {
            expect(SetSeedName.propTypes.body).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('onDonePress', () => {
                it('should call setSeedName prop method with trimmed accountName state prop', () => {
                    const props = getProps({
                        setSeedName: jest.fn(),
                    });

                    const wrapper = shallow(<SetSeedName {...props} />);
                    wrapper.setState({ accountName: '    foo   ' });
                    const inst = wrapper.instance();
                    inst.onDonePress();

                    expect(props.setSeedName).toHaveBeenCalledWith('foo');
                });

                it('should call update accountName prop in state with text when onChangeText prop method on CustomTextInput is triggered', () => {
                    const props = getProps();

                    const wrapper = shallow(<SetSeedName {...props} />);

                    expect(wrapper.state('accountName')).toEqual('MAIN ACCOUNT');

                    wrapper
                        .find('CustomTextInput')
                        .props()
                        .onChangeText('foo');

                    expect(wrapper.state('accountName')).toEqual('foo');
                });
            });
        });
    });
});
