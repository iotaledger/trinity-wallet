import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { Clipboard } from 'react-native';
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

        it('should return a View component as an immediate child', () => {
            const props = getProps();
            const wrapper = shallow(<ViewAddresses {...props} />);

            expect(wrapper.childAt(0).name()).toEqual('View');
        });

        it('should return a FlatList component', () => {
            const props = getProps({ addressData: { ['U'.repeat(81)]: {} } });
            const wrapper = shallow(<ViewAddresses {...props} />);

            expect(
                wrapper
                    .childAt(0)
                    .childAt(0)
                    .name(),
            ).toEqual('FlatList');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#copy', () => {
                afterEach(() => {
                    if (Clipboard.setString.mockClear) {
                        Clipboard.setString.mockClear();
                    }
                });

                it('should call setString on Clipboard', () => {
                    const fakeAddress = 'U'.repeat(81);
                    const props = getProps();
                    jest.spyOn(Clipboard, 'setString');

                    const instance = shallow(<ViewAddresses {...props} />).instance();
                    instance.copy(fakeAddress);

                    expect(Clipboard.setString).toHaveBeenCalledTimes(1);
                });

                it('should call prop method generateAlert', () => {
                    const fakeAddress = 'U'.repeat(81);
                    const props = getProps({ generateAlert: jest.fn() });

                    const instance = shallow(<ViewAddresses {...props} />).instance();
                    instance.copy(fakeAddress);

                    expect(props.generateAlert).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
