import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { Clipboard } from 'react-native';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import HistoryModalContent from '../../components/historyModalContent';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            onPress: noop,
            generateAlert: noop,
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
            status: 'Receive',
            confirmation: 'Received',
            value: 200,
            unit: 'i',
            time: Date.now(),
            message: 'Pink floyd',
            bundle: 'BUNDLE',
            addresses: [{ address: 'U'.repeat(81), value: 1, unit: 'i' }],
            style: {
                titleColor: 'white',
                containerBorderColor: { borderColor: 'white' },
                containerBackgroundColor: { backgroundColor: 'white' },
                confirmationStatusColor: { color: 'red' },
                defaultTextColor: { color: 'green' },
                backgroundColor: 'yellow',
                borderColor: { borderColor: 'orange' },
            },
        },
        overrides,
    );

describe('Testing HistoryModalContent component', () => {
    describe('propTypes', () => {
        it('should require an onPress function as a prop', () => {
            expect(HistoryModalContent.propTypes.onPress).toEqual(PropTypes.func.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(HistoryModalContent.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(HistoryModalContent.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a status string as a prop', () => {
            expect(HistoryModalContent.propTypes.status).toEqual(PropTypes.string.isRequired);
        });

        it('should require a confirmation string as a prop', () => {
            expect(HistoryModalContent.propTypes.confirmation).toEqual(PropTypes.string.isRequired);
        });

        it('should require a value number as a prop', () => {
            expect(HistoryModalContent.propTypes.value).toEqual(PropTypes.number.isRequired);
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
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(wrapper.name()).toEqual('TouchableOpacity');
        });

        it('should return six View components', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(wrapper.find('View').length).toEqual(7);
        });

        it('should return eight Text components', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(wrapper.find('Text').length).toEqual(7);
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

        it('should return value prop as third child to first Text component', () => {
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

        it('should return unit prop as fourth child to first Text component', () => {
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

        it('should return confirmation prop as a child to second Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(1)
                    .children()
                    .text(),
            ).toEqual('Received');
        });

        it('should return a translated "Bundle Hash" message as first child to fourth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(3)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('Bundle Hash');
        });

        it('should return a ":" message as second child to fourth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(3)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(':');
        });

        it('should return bundle prop as a child to fifth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(4)
                    .children()
                    .text(),
            ).toEqual('BUNDLE');
        });

        it('should call instance method copy with bundle prop and "bundle" string when onPress prop of second TouchableOpacity is triggered', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            const instance = wrapper.instance();

            jest.spyOn(instance, 'copy');
            const touchableOpacity = wrapper.find('TouchableOpacity').at(1);

            touchableOpacity.props().onPress();

            expect(instance.copy).toHaveBeenCalledWith('BUNDLE', 'bundle');
        });

        it('should return a ":" message as second child to sixth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(5)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(':');
        });

        it('should return a translated "Message" message as first child to sixth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(5)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('Message');
        });

        it('should return a ":" message as second child to sixth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(5)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(':');
        });

        it('should return message prop as a child to seventh Text component', () => {
            const props = getProps();

            const wrapper = shallow(<HistoryModalContent {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(6)
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

                it('should not call prop method generateAlert if second argument is not "bundle" or "address"', () => {
                    const props = getProps({
                        generateAlert: jest.fn(),
                    });

                    const instance = shallow(<HistoryModalContent {...props} />).instance();
                    instance.copy('arg', 'not-bundle-or-address');

                    expect(props.generateAlert).toHaveBeenCalledTimes(0);
                });

                it('should call prop method generateAlert if second argument is "bundle"', () => {
                    const props = getProps({
                        generateAlert: jest.fn(),
                    });

                    const instance = shallow(<HistoryModalContent {...props} />).instance();
                    instance.copy('arg', 'bundle');

                    expect(props.generateAlert).toHaveBeenCalledWith(
                        'success',
                        'Bundle hash copied',
                        'Your bundle has been copied to clipboard',
                    );
                });

                it('should call prop method generateAlert if second argument is "address"', () => {
                    const props = getProps({
                        generateAlert: jest.fn(),
                    });

                    const instance = shallow(<HistoryModalContent {...props} />).instance();
                    instance.copy('arg', 'address');

                    expect(props.generateAlert).toHaveBeenCalledWith(
                        'success',
                        'Address copied',
                        'Your address has been copied to clipboard',
                    );
                });
            });
        });
    });
});
