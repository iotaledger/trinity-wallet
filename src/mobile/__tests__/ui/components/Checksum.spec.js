import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { Checksum } from 'ui/components/Checksum';
import { MAX_SEED_TRITS } from 'shared-modules/libs/iota/utils';
import { trytesToTrits } from 'shared-modules/libs/iota/converter';
import { latestAddressWithoutChecksum, latestAddressChecksum } from 'shared-modules/__tests__/__samples__/addresses';
import theme from '../../../__mocks__/theme';

const getProps = (overrides) =>
    assign(
        {},
        {
            seed: new Int8Array(MAX_SEED_TRITS),
            theme,
            t: () => '',
            showModal: noop,
        },
        overrides,
    );

describe('Testing Checksum component', () => {
    describe('propTypes', () => {
        it('should require a seed object as a prop', () => {
            expect(Checksum.propTypes.seed).toEqual(PropTypes.object.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(Checksum.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(Checksum.propTypes.t).toEqual(PropTypes.func.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Checksum {...props} />);
            expect(wrapper.name()).toEqual('TouchableOpacity');
        });

        it('should return two Text components', () => {
            const props = getProps();

            const wrapper = shallow(<Checksum {...props} />);
            expect(wrapper.find('Text').length).toEqual(2);
        });
    });

    describe('static methods', () => {
        describe('when called', () => {
            describe('#getValue', () => {
                describe(`when seed length is not zero and seed length is less than ${MAX_SEED_TRITS}`, () => {
                    it('should return "< 81"', () => {
                        expect(Checksum.getValue(new Int8Array(MAX_SEED_TRITS - 10))).toEqual('< 81');
                    });
                });

                describe(`when seed length is greater than ${MAX_SEED_TRITS}`, () => {
                    it('should return "> 81"', () => {
                        expect(Checksum.getValue(new Int8Array(MAX_SEED_TRITS + 10))).toEqual('> 81');
                    });
                });

                describe(`when seed length is equal to ${MAX_SEED_TRITS}`, () => {
                    it('should return computed checksum of seed (in trytes)', () => {
                        const expectedChecksum = latestAddressChecksum.slice(-3);
                        const actualChecksum = Checksum.getValue(trytesToTrits(latestAddressWithoutChecksum));

                        expect(expectedChecksum).toEqual(actualChecksum);
                    });
                });
            });

            describe('#getStyle', () => {
                describe(`when seed length is equal to ${MAX_SEED_TRITS}`, () => {
                    it('should return "theme.primary.color"', () => {
                        expect(Checksum.getStyle(theme, new Int8Array(MAX_SEED_TRITS))).toEqual({
                            color: theme.primary.color,
                        });
                    });
                });

                describe(`when seed length is not equal to ${MAX_SEED_TRITS}`, () => {
                    it('should return "theme.body.color"', () => {
                        expect(Checksum.getStyle(theme, new Int8Array(MAX_SEED_TRITS + 100))).toEqual({
                            color: theme.body.color,
                        });
                    });
                });
            });
        });
    });
});
