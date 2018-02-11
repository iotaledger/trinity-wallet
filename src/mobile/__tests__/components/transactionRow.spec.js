import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import TransactionRow from '../../components/transactionRow';

const getProps = overrides =>
    assign(
        {},
        {
            generateAlert: noop,
            t: arg => {
                const translations = {
                    'send:message': 'Message',
                };

                return translations[arg] ? translations[arg] : 'foo';
            },
            status: 'Receive',
            confirmation: 'Received',
            value: 200,
            unit: 'i',
            time: Date.now(),
            message: 'Honey and the moon',
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

describe('Testing TransactionRow component', () => {
    describe('propTypes', () => {
        it('should require a generateAlert function as a prop', () => {
            expect(TransactionRow.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(TransactionRow.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a status string as a prop', () => {
            expect(TransactionRow.propTypes.status).toEqual(PropTypes.string.isRequired);
        });

        it('should require a confirmation string as a prop', () => {
            expect(TransactionRow.propTypes.confirmation).toEqual(PropTypes.string.isRequired);
        });

        it('should require a value number as a prop', () => {
            expect(TransactionRow.propTypes.value).toEqual(PropTypes.number.isRequired);
        });

        it('should require a unit string as a prop', () => {
            expect(TransactionRow.propTypes.unit).toEqual(PropTypes.string.isRequired);
        });

        it('should require a time number as a prop', () => {
            expect(TransactionRow.propTypes.time).toEqual(PropTypes.number.isRequired);
        });

        it('should require a message string as a prop', () => {
            expect(TransactionRow.propTypes.message).toEqual(PropTypes.string.isRequired);
        });

        it('should require a bundle string as a prop', () => {
            expect(TransactionRow.propTypes.bundle).toEqual(PropTypes.string.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(wrapper.name()).toEqual('TouchableOpacity');
        });

        it('should return seven View components', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(wrapper.find('View').length).toEqual(7);
        });

        it('should return six Text components', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(wrapper.find('Text').length).toEqual(6);
        });

        it('should return status prop as a child to Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(0)
                    .children()
                    .text(),
            ).toEqual('Receive');
        });

        it('should return value prop as first child to second Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(1)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('200');
        });

        it('should return two empty spaces as second child to second Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(1)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(' ');
        });

        it('should return unit prop as third child to second Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(1)
                    .children()
                    .at(2)
                    .text(),
            ).toEqual('i');
        });

        it('should return confirmation prop as a child to third Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(2)
                    .children()
                    .text(),
            ).toEqual('Received');
        });

        it('should return a translated "message" as first child to fourth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(3)
                    .children()
                    .at(0)
                    .text(),
            ).toEqual('Message');
        });

        it('should return a ":" as second child to fourth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(3)
                    .children()
                    .at(1)
                    .text(),
            ).toEqual(':');
        });

        it('should return confirmation prop as a child to fifth Text component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('Text')
                    .at(4)
                    .children()
                    .text(),
            ).toEqual('Honey and the moon');
        });

        it('should return a Modal component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(wrapper.find('ReactNativeModal').length).toEqual(1);
        });

        it('should return HistoryModalContent component as a child to Modal component', () => {
            const props = getProps();

            const wrapper = shallow(<TransactionRow {...props} />);
            expect(
                wrapper
                    .find('HistoryModalContent')
                    .parent()
                    .name(),
            ).toEqual('ReactNativeModal');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#toggleModal', () => {
                it('should invert isModalActive state prop', () => {
                    const props = getProps();

                    const wrapper = shallow(<TransactionRow {...props} />);

                    const instance = wrapper.instance();

                    expect(wrapper.state().isModalActive).toBe(false);

                    instance.toggleModal();

                    expect(wrapper.state().isModalActive).toBe(true);

                    instance.toggleModal();
                    expect(wrapper.state().isModalActive).toBe(false);
                });
            });

            describe('#getModalProps', () => {
                it('should return an object with all component props with an onPress prop', () => {
                    const props = getProps();

                    const wrapper = shallow(<TransactionRow {...props} />);

                    const instance = wrapper.instance();

                    const returnValue = instance.getModalProps();

                    const propsKeys = Object.keys(props);

                    expect(Object.keys(returnValue)).toEqual([...propsKeys, 'onPress']);
                });

                it('should return an object with onPress prop equals instance method toggleModal', () => {
                    const props = getProps();

                    const wrapper = shallow(<TransactionRow {...props} />);

                    const instance = wrapper.instance();

                    const returnValue = instance.getModalProps();

                    expect(returnValue.onPress).toEqual(instance.toggleModal);
                });
            });
        });
    });
});
