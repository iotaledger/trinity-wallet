import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { Clipboard } from 'react-native';
import { shallow } from 'enzyme';
import { ViewAddresses } from '../../containers/viewAddresses';

const getProps = (overrides) =>
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

    describe('static methods', () => {
        describe('#getAddressesAsList', () => {
            it('should return an empty array if argument passed to it is empty', () => {
                expect(ViewAddresses.getAddressesAsList({})).toEqual([]);
            });

            it('should return list with checksums appended to each item at index 0 if argument passed to it is not empty', () => {
                const fakeAddress = 'U'.repeat(81);
                const args = {
                    [fakeAddress]: {},
                };

                const checksum = 'NXELTUENX';
                const fakeAddressWithChecksum = `${fakeAddress}${checksum}`;
                const returnValue = [[fakeAddressWithChecksum, {}]];
                expect(ViewAddresses.getAddressesAsList(args)).toEqual(returnValue);
            });

            it('should reverse the returned list if argument passed to it is not empty', () => {
                const fakeAddressOne = 'U'.repeat(81);
                const fakeAddressTwo = 'A'.repeat(81);
                const fakeAddressThree = '9'.repeat(81);
                const args = {
                    [fakeAddressOne]: {},
                    [fakeAddressTwo]: {},
                    [fakeAddressThree]: {},
                };

                expect(ViewAddresses.getAddressesAsList(args)).not.toEqual([
                    [`${fakeAddressOne}NXELTUENX`],
                    {},
                    [`${fakeAddressTwo}YLFHUOJUY`],
                    {},
                    [`${fakeAddressThree}A9BEONKZW`],
                    {},
                ]);

                expect(ViewAddresses.getAddressesAsList(args)).not.toEqual([
                    [`${fakeAddressThree}A9BEONKZW`],
                    {},
                    [`${fakeAddressTwo}YLFHUOJUY`],
                    {},
                    [`${fakeAddressOne}NXELTUENX`],
                    {},
                ]);
            });
        });
    });
});
