import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import PropTypes from 'prop-types';
import { SetSeedName } from '../../containers/setSeedName';

const getProps = overrides =>
    assign(
        {},
        {
            account: {
                onboardingComplete: false,
            },
            navigator: {
                push: noop,
            },
            setSeedName: noop,
            t: () => 'foo',
            generateAlert: noop,
            setAdditionalAccountInfo: noop,
        },
        overrides,
    );

describe('Testing SetSeedName component', () => {
    describe('propTypes', () => {
        it('should require a secondaryBackgroundColor string as a prop', () => {
            expect(SetSeedName.propTypes.secondaryBackgroundColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a negativeColor string as a prop', () => {
            expect(SetSeedName.propTypes.negativeColor).toEqual(PropTypes.string.isRequired);
        });

        it('should require a seed string as a prop', () => {
            expect(SetSeedName.propTypes.seed).toEqual(PropTypes.string.isRequired);
        });

        it('should require a onboardingComplete bool as a prop', () => {
            expect(SetSeedName.propTypes.onboardingComplete).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a seedCount number as a prop', () => {
            expect(SetSeedName.propTypes.seedCount).toEqual(PropTypes.number.isRequired);
        });

        it('should require a backgroundColor string as a prop', () => {
            expect(SetSeedName.propTypes.backgroundColor).toEqual(PropTypes.string.isRequired);
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('onDonePress', () => {
                it('should call setSeedName prop method with trimmed accountName state prop', () => {
                    const props = getProps({
                        setSeedName: jest.fn(),
                    });

                    const wrapper = shallow(<SetSeedName {...props} />);
                    wrapper.setState({ accountName: '    foo   ' });
                    const inst = wrapper.instance();
                    inst.onDonePress();

                    expect(props.setSeedName).toHaveBeenCalledWith('foo');
                });
            });
        });
    });
});
