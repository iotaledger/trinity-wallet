import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import GenerateAddressButton from '../../components/GenerateAddressButton';

const getProps = (overrides) =>
    assign(
        {},
        {
            t: () => '',
            primaryColor: '#FFFFFF',
            primaryBody: '#000000',
            receiveAddress: 'U'.repeat(81),
            isGeneratingReceiveAddress: false,
            isGettingSensitiveInfoToGenerateAddress: false,
            onGeneratePress: noop,
            message: 'foo',
        },
        overrides,
    );

describe('Testing GenerateAddressButton component', () => {
    describe('propTypes', () => {
        it('should require a t function as a prop', () => {
            expect(GenerateAddressButton.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a primaryColor string as a prop', () => {
            expect(GenerateAddressButton.propTypes.primaryColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a primaryBody string as a prop', () => {
            expect(GenerateAddressButton.propTypes.primaryBody).toEqual(PropTypes.string.isRequired);
        });

        it('should require a receiveAddress string as a prop', () => {
            expect(GenerateAddressButton.propTypes.receiveAddress).toEqual(PropTypes.string.isRequired);
        });

        it('should require an isGeneratingReceiveAddress boolean as a prop', () => {
            expect(GenerateAddressButton.propTypes.isGeneratingReceiveAddress).toEqual(PropTypes.bool.isRequired);
        });

        it('should require an isGettingSensitiveInfoToGenerateAddress boolean as a prop', () => {
            expect(GenerateAddressButton.propTypes.isGettingSensitiveInfoToGenerateAddress).toEqual(
                PropTypes.bool.isRequired,
            );
        });

        it('should require an onGeneratePress function as a prop', () => {
            expect(GenerateAddressButton.propTypes.onGeneratePress).toEqual(PropTypes.func.isRequired);
        });

        it('should require an message string as a prop', () => {
            expect(GenerateAddressButton.propTypes.message).toEqual(PropTypes.string.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<GenerateAddressButton {...props} />);
            expect(wrapper.name()).toEqual('View');
        });
    });

    describe('when "isGettingSensitiveInfoToGenerateAddress" prop is true and "isGeneratingReceiveAddress" prop is false', () => {
        it('should return "ActivityIndicator" component', () => {
            const props = getProps({
                isGettingSensitiveInfoToGenerateAddress: true,
            });

            const wrapper = shallow(<GenerateAddressButton {...props} />);
            expect(wrapper.find('ActivityIndicator').length).toEqual(1);
        });
    });

    describe('when "isGettingSensitiveInfoToGenerateAddress" prop is false and "isGeneratingReceiveAddress" prop is true', () => {
        it('should return "ActivityIndicator" component', () => {
            const props = getProps({
                isGeneratingReceiveAddress: true,
            });

            const wrapper = shallow(<GenerateAddressButton {...props} />);
            expect(wrapper.find('ActivityIndicator').length).toEqual(1);
        });
    });

    describe('when "isGettingSensitiveInfoToGenerateAddress" prop is true and "isGeneratingReceiveAddress" prop is true', () => {
        it('should return "ActivityIndicator" component', () => {
            const props = getProps({
                isGeneratingReceiveAddress: true,
                isGettingSensitiveInfoToGenerateAddress: true,
            });

            const wrapper = shallow(<GenerateAddressButton {...props} />);
            expect(wrapper.find('ActivityIndicator').length).toEqual(1);
        });
    });

    describe('when "isGettingSensitiveInfoToGenerateAddress" prop is false and "isGeneratingReceiveAddress" prop is false', () => {
        it('should not return "ActivityIndicator" component', () => {
            const props = getProps();

            const wrapper = shallow(<GenerateAddressButton {...props} />);
            expect(wrapper.find('ActivityIndicator').length).toEqual(0);
        });
    });
});
