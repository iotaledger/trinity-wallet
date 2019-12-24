import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { AdvancedSettings } from 'ui/views/wallet/AdvancedSettings';
import theme from '../../../../__mocks__/theme';

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

jest.mock('react-native-camera', () => {});
jest.mock('rn-fetch-blob', () => {});

jest.mock('rn-fetch-blob', () => {});

jest.mock('react-native-share', () => {});

jest.mock('react-native-document-picker', () => ({
    pick: jest.fn(() => Promise.resolve()),
    isCancel: () => false,
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            setSetting: noop,
            t: () => '',
            theme,
            autoPromotion: false,
            deepLinking: false,
            generateAlert: noop,
            isSendingTransfer: false,
        },
        overrides,
    );

describe('Testing AdvancedSettings component', () => {
    describe('propTypes', () => {
        it('should require a setSetting function as a prop', () => {
            expect(AdvancedSettings.propTypes.setSetting).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(AdvancedSettings.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(AdvancedSettings.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<AdvancedSettings {...props} />);
            expect(wrapper.name()).toEqual('View');
        });
    });
});
