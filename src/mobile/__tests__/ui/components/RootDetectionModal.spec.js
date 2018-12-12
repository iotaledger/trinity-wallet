import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { RootDetectionModal as RootDetectionModalComponent } from 'ui/components/RootDetectionModal';
import theme from '../../../__mocks__/theme';

const getProps = (overrides) =>
    assign(
        {},
        {
            t: () => '',
            closeApp: noop,
            hideModal: noop,
            theme,
        },
        overrides,
    );

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

describe('Testing RootDetectionModal component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(RootDetectionModalComponent.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a closeApp function as a prop', () => {
            expect(RootDetectionModalComponent.propTypes.closeApp).toEqual(PropTypes.func.isRequired);
        });

        it('should require a hideModal function as a prop', () => {
            expect(RootDetectionModalComponent.propTypes.hideModal).toEqual(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(RootDetectionModalComponent.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<RootDetectionModalComponent {...props} />);
            expect(wrapper.name()).toEqual('Connect(ModalViewComponent)');
        });

        it('should call prop method hideModal when onRightButtonPress prop of ModalView component is triggered', () => {
            const props = getProps({
                hideModal: jest.fn(),
            });

            const wrapper = shallow(<RootDetectionModalComponent {...props} />);

            expect(props.hideModal).toHaveBeenCalledTimes(0);

            wrapper.props().onRightButtonPress();

            expect(props.hideModal).toHaveBeenCalledTimes(1);
        });

        it('should call prop method closeApp when onLeftButtonPress prop of ModalView is triggered', () => {
            const props = getProps({
                closeApp: jest.fn(),
            });

            const wrapper = shallow(<RootDetectionModalComponent {...props} />);

            expect(props.closeApp).toHaveBeenCalledTimes(0);

            wrapper.props().onLeftButtonPress();

            expect(props.closeApp).toHaveBeenCalledTimes(1);
        });
    });
});
