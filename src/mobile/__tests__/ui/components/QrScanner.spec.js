import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { QRScanner as QrScannerComponent } from 'ui/components/QrScanner';
import theme from '../../../__mocks__/theme';

jest.mock('react-native-camera', () => ({}));
jest.mock('react-native-qr-scanner', () => ({}));
jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            t: () => '',
            onQRRead: noop,
            hideModal: noop,
            theme,
        },
        overrides,
    );

describe('Testing QrScanner component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(QrScannerComponent.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a onQRRead function as a prop', () => {
            expect(QrScannerComponent.propTypes.onQRRead).toEqual(PropTypes.func.isRequired);
        });

        it('should require a hideModal function as a prop', () => {
            expect(QrScannerComponent.propTypes.hideModal).toEqual(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(QrScannerComponent.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<QrScannerComponent {...props} />);
            expect(wrapper.name()).toEqual('Connect(ModalViewComponent)');
        });

        it('should return a QRscanner component', () => {
            const props = getProps();

            const wrapper = shallow(<QrScannerComponent {...props} />);
            expect(wrapper.childAt(0).childAt(0).length).toEqual(1);
        });

        it('should call prop method onQRRead when onRead prop of QRscanner is triggered', () => {
            const props = getProps({
                onQRRead: jest.fn(),
            });

            const wrapper = shallow(<QrScannerComponent {...props} />);

            expect(props.onQRRead).toHaveBeenCalledTimes(0);

            wrapper
                .childAt(0)
                .childAt(0)
                .props()
                .onRead({ data: 'foo' });

            expect(props.onQRRead).toHaveBeenCalledWith('foo');
        });
    });
});
