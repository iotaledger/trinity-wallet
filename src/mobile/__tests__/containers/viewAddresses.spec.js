import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { ViewAddresses } from '../../containers/viewAddresses';

const getProps = overrides =>
    assign(
        {},
        {
            addressData: {},
            generateAlert: noop,
            backPress: noop,
            secondaryBackgroundColor: 'white',
            arrowLeftImagePath: 0,
            t: noop,
        },
        overrides,
    );

describe('Testing ViewAddresses component', () => {
    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();
            const wrapper = shallow(<ViewAddresses {...props} />);

            expect(wrapper.name()).toEqual('View');
        });

        it('should return a View component with Text as its immediate child if addressData props is empty', () => {
            const props = getProps();
            const wrapper = shallow(<ViewAddresses {...props} />);

            expect(wrapper.childAt(0).name()).toEqual('View');
            expect(
                wrapper
                    .childAt(0)
                    .childAt(0)
                    .name(),
            ).toEqual('Text');
        });

        it('should return a View component with ListView as its immediate child if addressData props is not empty', () => {
            const props = getProps({ addressData: { ['U'.repeat(81)]: {} } });
            const wrapper = shallow(<ViewAddresses {...props} />);

            expect(wrapper.childAt(0).name()).toEqual('View');
            expect(
                wrapper
                    .childAt(0)
                    .childAt(0)
                    .name(),
            ).not.toEqual('Text');
            expect(
                wrapper
                    .childAt(0)
                    .childAt(0)
                    .name(),
            ).toEqual('ListViewMock');
        });
    });
});
