import assign from 'lodash/assign';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import Checksum from '../../components/Checksum';

const getProps = (overrides) =>
    assign(
        {},
        {
            seed: '9'.repeat(81),
            theme: { input: {}, body: {}, primary: {} },
        },
        overrides,
    );

describe('Testing Checksum component', () => {
    describe('propTypes', () => {
        it('should require a seed string as a prop', () => {
            expect(Checksum.propTypes.seed).toEqual(PropTypes.string.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(Checksum.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<Checksum {...props} />);
            expect(wrapper.name()).toEqual('View');
        });

        it('should return a Text component', () => {
            const props = getProps();

            const wrapper = shallow(<Checksum {...props} />);
            expect(wrapper.find('Text').length).toEqual(1);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#getChecksumValue', () => {
                describe('when seed length is not zero and seed contains any character other than (A-Z, 9)', () => {
                    it('should return "!"', () => {
                        const props = getProps({ seed: '-!' });

                        const instance = shallow(<Checksum {...props} />).instance();
                        const checksum = instance.getChecksumValue();

                        expect(checksum).toEqual('!');
                    });
                });

                describe('when seed length is not zero and seed length is less than 81', () => {
                    it('should return "< 81"', () => {
                        const props = getProps({ seed: 'A'.repeat(80) });

                        const instance = shallow(<Checksum {...props} />).instance();
                        const checksum = instance.getChecksumValue();

                        expect(checksum).toEqual('< 81');
                    });
                });

                describe('when seed length is 81 and seed contains valid characters (A-Z, 9)', () => {
                    it('should return computed checksum of seed', () => {
                        const props = getProps({ seed: '9'.repeat(81) });

                        const instance = shallow(<Checksum {...props} />).instance();
                        const checksum = instance.getChecksumValue();

                        expect(checksum).toEqual('KZW');
                    });
                });
            });
        });
    });
});
