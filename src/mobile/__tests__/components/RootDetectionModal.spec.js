import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { RootDetectionModal as RootDetectionModalComponent } from '../../components/RootDetectionModal';

const getProps = (overrides) =>
    assign(
        {},
        {
            t: () => '',
            closeApp: noop,
            hideModal: noop,
            backgroundColor: '#ffffff',
            textColor: {},
            borderColor: {},
            warningColor: {},
        },
        overrides,
    );

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

        it('should require a backgroundColor string as a prop', () => {
            expect(RootDetectionModalComponent.propTypes.backgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a textColor object as a prop', () => {
            expect(RootDetectionModalComponent.propTypes.textColor).toEqual(PropTypes.object.isRequired);
        });

        it('should require a borderColor object as a prop', () => {
            expect(RootDetectionModalComponent.propTypes.borderColor).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<RootDetectionModalComponent {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should call prop method hideModal when onRightButtonPress prop of OnboardingButtons is triggered', () => {
            const props = getProps({
                hideModal: jest.fn(),
            });

            const wrapper = shallow(<RootDetectionModalComponent {...props} />);

            expect(props.hideModal).toHaveBeenCalledTimes(0);

            wrapper
                .children()
                .at(0)
                .children()
                .last()
                .props()
                .onRightButtonPress();

            expect(props.hideModal).toHaveBeenCalledTimes(1);
        });

        it('should call prop method closeApp when onLeftButtonPress prop of OnboardingButtons is triggered', () => {
            const props = getProps({
                closeApp: jest.fn(),
            });

            const wrapper = shallow(<RootDetectionModalComponent {...props} />);

            expect(props.closeApp).toHaveBeenCalledTimes(0);

            wrapper
                .children()
                .at(0)
                .children()
                .last()
                .props()
                .onLeftButtonPress();

            expect(props.closeApp).toHaveBeenCalledTimes(1);
        });
    });
});
