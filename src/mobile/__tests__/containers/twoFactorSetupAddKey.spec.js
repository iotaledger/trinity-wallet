import assign from 'lodash/assign';
import noop from 'lodash/noop';
import each from 'lodash/each';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { TwoFactorSetupAddKey } from '../../containers/twoFactorSetupAddKey';

jest.mock('react-native-keychain', () => ({
    setGenericPassword: () => Promise.resolve({}),
    getGenericPassword: () => Promise.resolve({}),
}));

const getProps = overrides =>
    assign(
        {},
        {
            backgroundColor: 'white',
            secondaryBackgroundColor: 'white',
            navigator: {},
            generateAlert: noop,
        },
        overrides,
    );

describe('Testing TwoFactorSetupAddKey component', () => {
    describe('propTypes', () => {
        it('should require a backgroundColor string as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.backgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a secondaryBackgroundColor string as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.secondaryBackgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a navigator object as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.navigator).toEqual(PropTypes.object.isRequired);
        });

        it('should require a generateAlert string as a prop', () => {
            expect(TwoFactorSetupAddKey.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return a DynamicStatusBar component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('DynamicStatusBar').length).toEqual(1);
        });

        it('should return six View components', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('View').length).toEqual(6);
        });

        it('should return an Image component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('Image').length).toEqual(1);
        });

        it('should return a QRCode component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('QRCode').length).toEqual(1);
        });

        it('should return a TouchableOpacity component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('TouchableOpacity').length).toEqual(1);
        });

        it('should return four Text components', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(wrapper.find('Text').length).toEqual(4);
        });

        it('should return a StatefulDropdownAlert component', () => {
            const props = getProps();

            const wrapper = shallow(<TwoFactorSetupAddKey {...props} />);
            expect(
                wrapper
                    .children()
                    .last()
                    .name()
                    .includes('StatefulDropdownAlert'),
            ).toEqual(true);
        });
    });
});
