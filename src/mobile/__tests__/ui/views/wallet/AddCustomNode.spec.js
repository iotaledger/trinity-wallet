import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { AddCustomNode } from 'ui/views/wallet/AddCustomNode';

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            node: 'https://foo.baz',
            theme: { body: {} },
            backPress: noop,
            t: () => '',
            setNode: noop,
            loading: false,
        },
        overrides,
    );

describe('Testing AddCustomNode component', () => {
    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<AddCustomNode {...props} />);
            expect(wrapper.name()).toEqual('TouchableWithoutFeedback');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#addNode', () => {
                it('should call prop method "setNode" with state.customNode and true', () => {
                    const props = getProps({
                        setNode: jest.fn(),
                    });

                    const wrapper = shallow(<AddCustomNode {...props} />);
                    const instance = wrapper.instance();

                    wrapper.setState({ customNode: 'foo' });
                    instance.addNode();

                    expect(props.setNode).toHaveBeenCalledWith(...['foo', true]);
                });
            });
        });
    });
});
