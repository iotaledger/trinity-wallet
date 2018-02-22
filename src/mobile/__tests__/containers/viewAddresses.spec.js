import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
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
    describe('propTypes', () => {
        it('should require an addressData object as a prop', () => {
            expect(ViewAddresses.propTypes.addressData).toEqual(PropTypes.object.isRequired);
        });

        it('should require a secondaryBackgroundColor string as a prop', () => {
            expect(ViewAddresses.propTypes.secondaryBackgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require an arrowLeftImagePath number as a prop', () => {
            expect(ViewAddresses.propTypes.arrowLeftImagePath).toEqual(PropTypes.number.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(ViewAddresses.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a backPress function as a prop', () => {
            expect(ViewAddresses.propTypes.backPress).toEqual(PropTypes.func.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(ViewAddresses.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });
    });

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

        it('should return a View component', () => {
            const props = getProps({ addressData: { ['U'.repeat(81)]: {} } });
            const wrapper = shallow(<ViewAddresses {...props} />);

            expect(
                wrapper
                    .childAt(0)
                    .childAt(0)
                    .name(),
            ).toEqual('View');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#prepAddresses', () => {
                it('should always return an array', () => {
                    const props = getProps();

                    const wrapper = shallow(<ViewAddresses {...props} />);

                    const instance = wrapper.instance();
                    let returnValue = instance.prepAddresses();

                    // When addresses are an empty object
                    expect(Array.isArray(returnValue)).toEqual(true);

                    wrapper.setProps({ addressData: { ['U'.repeat(81)]: {} } });

                    returnValue = instance.prepAddresses();

                    expect(Array.isArray(returnValue)).toEqual(true);
                });

                it('should have atleast "balance", "unit" and "address" props in each item of the returned array', () => {
                    const props = getProps({
                        addressData: {
                            ['U'.repeat(81)]: {},
                        },
                    });

                    const wrapper = shallow(<ViewAddresses {...props} />);

                    const instance = wrapper.instance();
                    const returnValue = instance.prepAddresses();

                    expect(returnValue.length).toEqual(1);

                    const head = returnValue[0];

                    expect('balance' in head).toEqual(true);
                    expect('unit' in head).toEqual(true);
                    expect('address' in head).toEqual(true);
                });

                it('should assign checksum to address prop in each item of the returned array', () => {
                    const fakeAddress = 'U'.repeat(81);
                    const props = getProps({
                        addressData: {
                            [fakeAddress]: {},
                        },
                    });

                    const wrapper = shallow(<ViewAddresses {...props} />);

                    const instance = wrapper.instance();
                    const returnValue = instance.prepAddresses();

                    expect(returnValue.length).toEqual(1);

                    const head = returnValue[0];

                    const checksum = 'NXELTUENX';
                    const fakeAddressWithChecksum = `${fakeAddress}${checksum}`;
                    expect(head.address).toEqual(fakeAddressWithChecksum);
                });

                it('should return an ordered array in descending by index prop', () => {
                    const props = getProps({
                        addressData: {
                            ['U'.repeat(81)]: { index: 0 },
                            ['A'.repeat(81)]: { index: 3 },
                            ['B'.repeat(81)]: { index: 32 },
                        },
                    });

                    const wrapper = shallow(<ViewAddresses {...props} />);

                    const instance = wrapper.instance();
                    const returnValue = instance.prepAddresses();

                    expect(returnValue[0].index).not.toEqual(0);
                    expect(returnValue[0].index).toEqual(32);

                    expect(returnValue[1].index).toEqual(3);
                    expect(returnValue[2].index).toEqual(0);
                });
            });

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
