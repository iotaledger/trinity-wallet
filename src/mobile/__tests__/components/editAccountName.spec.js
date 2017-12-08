import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import EditAccountName from '../../components/editAccountName';

jest.mock('react-native-device-info');

const getProps = overrides =>
    assign(
        {},
        {
            seedIndex: 0,
            accountName: 'foo',
            saveAccountName: noop,
            backPress: noop,
        },
        overrides,
    );

describe('Testing EditAccountName component', () => {
    describe('propTypes', () => {
        it('should require a seedIndex number as a prop', () => {
            expect(EditAccountName.propTypes.seedIndex).toBe(PropTypes.number.isRequired);
        });
    });
});
