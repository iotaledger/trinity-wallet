import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import HistoryModalContent from 'ui/components/HistoryModalContent';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            t: (arg) => {
                const translations = {
                    'send:message': 'Message',
                    addresses: 'Addresses',
                    bundleHash: 'Bundle Hash',
                    bundleHashCopied: 'Bundle hash copied',
                    bundleHashCopiedExplanation: 'Your bundle has been copied to clipboard',
                    addressCopied: 'Address copied',
                    addressCopiedExplanation: 'Your address has been copied to clipboard',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
            promote: noop,
            disableWhen: false,
            status: 'Receive',
            value: 200,
            fullValue: 200,
            unit: 'i',
            time: Date.now(),
            message: 'Pink floyd',
            bundle: 'BUNDLE',
            addresses: [{ address: 'U'.repeat(81), value: 1, unit: 'i' }],
            confirmationBool: false,
            mode: 'Standard',
            generateAlert: noop,
            style: {
                titleColor: 'white',
                containerBorderColor: { borderColor: 'white' },
                containerBackgroundColor: { backgroundColor: 'white' },
                confirmationStatusColor: { color: 'red' },
                defaultTextColor: { color: 'green' },
                backgroundColor: 'white',
                borderColor: { borderColor: 'orange' },
                barBg: 'black',
                barColor: 'white',
                buttonsOpacity: { opacity: 1 },
                primaryColor: '#ffffff',
                primaryBody: '#000000',
            },
            bundleIsBeingPromoted: false,
            hasFailedAutopromotion: false,
            isFailedTransaction: noop,
            retryFailedTransaction: noop,
            isRetryingFailedTransaction: false,
        },
        overrides,
    );

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

describe('Testing HistoryModalContent component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(HistoryModalContent.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a status string as a prop', () => {
            expect(HistoryModalContent.propTypes.status).toEqual(PropTypes.string.isRequired);
        });

        it('should require a value number as a prop', () => {
            expect(HistoryModalContent.propTypes.value).toEqual(PropTypes.number.isRequired);
        });

        it('should require a fullValue number as a prop', () => {
            expect(HistoryModalContent.propTypes.fullValue).toEqual(PropTypes.number.isRequired);
        });

        it('should require a unit string as a prop', () => {
            expect(HistoryModalContent.propTypes.unit).toEqual(PropTypes.string.isRequired);
        });

        it('should require a time number as a prop', () => {
            expect(HistoryModalContent.propTypes.time).toEqual(PropTypes.number.isRequired);
        });

        it('should require a message string as a prop', () => {
            expect(HistoryModalContent.propTypes.message).toEqual(PropTypes.string);
        });

        it('should require a bundle string as a prop', () => {
            expect(HistoryModalContent.propTypes.bundle).toEqual(PropTypes.string.isRequired);
        });

        it('should require a disableWhen boolean as a prop', () => {
            expect(HistoryModalContent.propTypes.disableWhen).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a bundleIsBeingPromoted boolean as a prop', () => {
            expect(HistoryModalContent.propTypes.bundleIsBeingPromoted).toEqual(PropTypes.bool.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(wrapper.name()).toEqual('TouchableWithoutFeedback');
        });

        it('should return a ScrollView component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(wrapper.find('ScrollViewMock').length).toEqual(1);
        });

        it('should return status prop as first child to first Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(0)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('Receive');
        });

        it('should return fullValue prop as third child to first Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(0)
                    .children()
                    .at(2)
                    .text(),
            ).toEqual('200');
        });

        it('should return unit prop as third child to first Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(0)
                    .children()
                    .at(3)
                    .text(),
            ).toEqual('i');
        });

        it('should return status prop as second child to first Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(0)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('Receive');
        });

        it('should return a translated "Bundle Hash" message as first child to third Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(2)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('Bundle Hash');
        });

        it('should return a ":" message as second child to third Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(2)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(':');
        });

        it('should return bundle prop as a child to fourth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(3)
                    .children()
                    .text(),
            ).toEqual('BUNDLE');
        });

        it('should call instance method copy with bundle prop and "bundle" string when onPress prop of second TouchableOpacity is triggered', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            const instance = wrapper.instance();

            jest.spyOn(instance, 'copy');
            const touchableOpacity = wrapper.find('TouchableOpacity').at(0);

            touchableOpacity.props().onPress();

            expect(instance.copy).toHaveBeenCalledWith('BUNDLE', 'bundle');
        });

        it('should return a ":" message as second child to fifth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(4)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(':');
        });

        it('should return a translated "Message" message as first child to fifth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(4)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('Message');
        });

        it('should return a ":" message as second child to fifth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(4)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(':');
        });

        it('should return message prop as a child to sixth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(5)
                    .children()
                    .text(),
            ).toEqual('Pink floyd');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#copy', () => {
                afterEach(() => {
                    if (Clipboard.setString.mockClear) {
                        Clipboard.setString.mockClear();
                    }
                });

                it('should call setString on Clipboard with first argument', () => {
                    const props = getProps();
                    jest.spyOn(Clipboard, 'setString');

                    const instance = shallow(<HistoryModalContent {...props} />).instance();
                    instance.copy('arg', 'type');

                    expect(Clipboard.setString).toHaveBeenCalledWith('arg');
                });
            });
        });
    });
});
