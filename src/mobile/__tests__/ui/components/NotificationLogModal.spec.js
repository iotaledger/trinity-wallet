import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { NotificationLogModal as NotificationLog } from 'ui/components/NotificationLogModal';
import theme from '../../../__mocks__/theme';

const getProps = (overrides) =>
    assign(
        {},
        {
            backgroundColor: '#ffffff',
            theme,
            hideModal: noop,
            notificationLog: [],
            clearLog: noop,
            t: () => '',
        },
        overrides,
    );

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

describe('Testing NotificationLogModal component', () => {
    describe('propTypes', () => {
        it('should require a theme string as a prop', () => {
            expect(NotificationLog.propTypes.theme).toEqual(PropTypes.object.isRequired);
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
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<NotificationLog {...props} />);

            expect(wrapper.name()).toEqual('Connect(ModalViewComponent)');
        });

        it('should call instance method "clearNotificationLog" when onLeftButtonPress prop of second ModalView element is triggered', () => {
            const props = getProps();

            const wrapper = shallow(<NotificationLog {...props} />);
            const instance = wrapper.instance();

            jest.spyOn(instance, 'clearNotificationLog');

            expect(instance.clearNotificationLog).toHaveBeenCalledTimes(0);

            wrapper.props().onLeftButtonPress();

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
