import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
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
            t: noop,
        },
        overrides,
    );

describe('Testing SetSeedName component', () => {
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
