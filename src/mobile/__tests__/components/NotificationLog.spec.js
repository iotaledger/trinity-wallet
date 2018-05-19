import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { NotificationLog } from '../../components/NotificationLog';

const getProps = (overrides) =>
    assign(
        {},
        {
            backgroundColor: '#ffffff',
            borderColor: { borderColor: '#ffffff' },
            textColor: { color: '#ffffff' },
            barColor: '#ffffff',
            barBg: '#ffffff',
            hideModal: noop,
            notificationLog: [],
            clearLog: noop,
            t: () => '',
        },
        overrides,
    );

describe('Testing NotificationLog component', () => {
    describe('propTypes', () => {
        it('should require a backgroundColor string as a prop', () => {
            expect(NotificationLog.propTypes.backgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a borderColor object as a prop', () => {
            expect(NotificationLog.propTypes.borderColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(NotificationLog.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a barColor string as a prop', () => {
            expect(NotificationLog.propTypes.barColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a hideModal function as a prop', () => {
            expect(NotificationLog.propTypes.hideModal).toEqual(PropTypes.func.isRequired);
        });

        it('should require a clearLog function as a prop', () => {
            expect(NotificationLog.propTypes.clearLog).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(NotificationLog.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a barBg function as a prop', () => {
            expect(NotificationLog.propTypes.barBg).toEqual(PropTypes.string.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<NotificationLog {...props} />);
            expect(wrapper.name()).toEqual('TouchableOpacity');
        });

        it('should call prop method "hideModal" when onPress prop of parent element is triggered', () => {
            const props = getProps({
                hideModal: jest.fn(),
            });

            const wrapper = shallow(<NotificationLog {...props} />);
            const onPress = wrapper.props().onPress;

            expect(props.hideModal).toHaveBeenCalledTimes(0);
            onPress();
            expect(props.hideModal).toHaveBeenCalledTimes(1);
        });

        it('should call instance method "clearNotificationLog" when onPress prop of second TouchableOpacity element is triggered', () => {
            const props = getProps();

            const wrapper = shallow(<NotificationLog {...props} />);
            const instance = wrapper.instance();

            jest.spyOn(instance, 'clearNotificationLog');

            const touchableOpacity = wrapper.find('TouchableOpacity').at(1);

            expect(instance.clearNotificationLog).toHaveBeenCalledTimes(0);

            touchableOpacity.props().onPress();

            expect(instance.clearNotificationLog).toHaveBeenCalledTimes(1);
        });
    });

    describe('instance', () => {
        describe('when called', () => {
            describe('clearNotificationLog', () => {
                it('should call prop method hideModal', () => {
                    const props = getProps({
                        hideModal: jest.fn(),
                    });

                    const wrapper = shallow(<NotificationLog {...props} />);
                    const instance = wrapper.instance();

                    instance.clearNotificationLog();

                    expect(props.hideModal).toHaveBeenCalledTimes(1);
                });

                it('should call prop method clearLog', () => {
                    const props = getProps({
                        clearLog: jest.fn(),
                    });

                    const wrapper = shallow(<NotificationLog {...props} />);
                    const instance = wrapper.instance();

                    instance.clearNotificationLog();

                    expect(props.clearLog).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
