import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { LogoutConfirmationModal } from 'ui/components/LogoutConfirmationModal';
import theme from '../../../__mocks__/theme';

const getProps = (overrides) =>
    assign(
        {},
        {
            t: () => '',
            hideModal: noop,
            logout: noop,
            theme,
        },
        overrides,
    );

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

describe('Testing LogoutConfirmationModal component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(LogoutConfirmationModal.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a hideModal function as a prop', () => {
            expect(LogoutConfirmationModal.propTypes.hideModal).toEqual(PropTypes.func.isRequired);
        });

        it('should require a logout function as a prop', () => {
            expect(LogoutConfirmationModal.propTypes.logout).toEqual(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(LogoutConfirmationModal.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<LogoutConfirmationModal {...props} />);
            expect(wrapper.name()).toEqual('Connect(ModalViewComponent)');
        });
    });
});
