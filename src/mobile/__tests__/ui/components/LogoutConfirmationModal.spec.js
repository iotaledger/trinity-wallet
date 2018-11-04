import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { LogoutConfirmationModal } from 'ui/components/LogoutConfirmationModal';

const getProps = (overrides) =>
    assign(
        {},
        {
            t: () => '',
            hideModal: noop,
            logout: noop,
            backgroundColor: { backgroundColor: '#FFFFFF' },
            textColor: {},
            borderColor: {},
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

        it('should require a backgroundColor string as a prop', () => {
            expect(LogoutConfirmationModal.propTypes.backgroundColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(LogoutConfirmationModal.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a borderColor object as a prop', () => {
            expect(LogoutConfirmationModal.propTypes.borderColor).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<LogoutConfirmationModal {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return a Text component', () => {
            const props = getProps();

            const wrapper = shallow(<LogoutConfirmationModal {...props} />);
            expect(wrapper.find('Text').length).toEqual(1);
        });
    });
});
