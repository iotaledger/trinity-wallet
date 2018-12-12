import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { PermissionsAndroid } from 'react-native';
import { shallow } from 'enzyme';
import { SeedVaultImportComponent } from 'ui/components/SeedVaultImportComponent';
import theme from '../../../__mocks__/theme';

jest.mock('rn-fetch-blob', () => ({ DocumentDir: () => {} }));
jest.mock('nodejs-mobile-react-native', () => ({
    start: () => {},
    channel: {
        addListener: () => {},
        removeListener: () => {},
    },
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            theme,
            t: () => '',
            generateAlert: noop,
            openPasswordValidationModal: noop,
            onSeedImport: noop,
            onRef: noop,
        },
        overrides,
    );

describe('Testing SeedVaultImportComponent component', () => {
    describe('instance methods', () => {
        describe('when called', () => {
            describe('#grantPermissions', () => {
                beforeEach(() => {
                    jest.mock('PermissionsAndroid', () => ({
                        request: jest.fn(() => Promise.resolve(true)),
                        PERMISSIONS: {},
                        RESULTS: {
                            GRANTED: 'granted',
                        },
                    }));
                });

                describe('when read permission is already granted', () => {
                    it('should resolve true', () => {
                        const props = getProps();

                        const instance = shallow(<SeedVaultImportComponent {...props} />).instance();

                        return instance.grantPermissions().then((result) => expect(result).toEqual(true));
                    });
                });

                describe('when read permission is granted by user', () => {
                    it('should resolve "granted"', () => {
                        PermissionsAndroid.request.mockReturnValueOnce(Promise.resolve('granted'));
                        const props = getProps();

                        const instance = shallow(<SeedVaultImportComponent {...props} />).instance();

                        return instance.grantPermissions().then((result) => expect(result).toEqual('granted'));
                    });
                });

                describe('when read permission is denied by user', () => {
                    it('should throw an error with message "Read permissions not granted."', () => {
                        PermissionsAndroid.request.mockReturnValueOnce(Promise.resolve('denied'));
                        const props = getProps();

                        const instance = shallow(<SeedVaultImportComponent {...props} />).instance();

                        return instance
                            .grantPermissions()
                            .catch((err) => expect(err).toEqual(new Error('Read permissions not granted.')));
                    });
                });
            });
        });
    });
});
