import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { QRScanner as QrScannerComponent } from '../../components/QrScanner';

jest.mock('react-native-camera', () => ({}));
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
            body: { bg: '#ffffff' },
            primary: {},
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

        it('should require a body object as a prop', () => {
            expect(QrScannerComponent.propTypes.body).toEqual(PropTypes.object.isRequired);
        });

        it('should require a primary object as a prop', () => {
            expect(QrScannerComponent.propTypes.primary).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<QrScannerComponent {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return a QrCodeScanner component', () => {
            const props = getProps();

            const wrapper = shallow(<QrScannerComponent {...props} />);
            expect(wrapper.find('QRCodeScanner').length).toEqual(1);
        });

        it('should call prop method hideModal when onPress prop of TouchableOpacity is triggered', () => {
            const props = getProps({
                hideModal: jest.fn(),
            });

            const wrapper = shallow(<QrScannerComponent {...props} />);

            expect(props.hideModal).toHaveBeenCalledTimes(0);

            wrapper
                .find('TouchableOpacity')
                .props()
                .onPress();

            expect(props.hideModal).toHaveBeenCalledTimes(1);
        });

        it('should call prop method onQRRead when onRead prop of QRCodeScanner is triggered', () => {
            const props = getProps({
                onQRRead: jest.fn(),
            });

            const wrapper = shallow(<QrScannerComponent {...props} />);

            expect(props.onQRRead).toHaveBeenCalledTimes(0);

            wrapper
                .find('QRCodeScanner')
                .props()
                .onRead({ data: 'foo' });

            expect(props.onQRRead).toHaveBeenCalledWith('foo');
        });
    });
});
