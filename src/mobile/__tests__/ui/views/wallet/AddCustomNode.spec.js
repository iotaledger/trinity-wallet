import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { AddCustomNode } from 'ui/views/wallet/AddCustomNode';
import theme from '../../../../__mocks__/theme';

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            node: 'https://foo.baz',
            theme,
            t: () => '',
            setNode: noop,
            loading: false,
            customNodes: [],
            removeCustomNode: noop,
            setLoginRoute: noop,
            setSetting: noop,
            loginRoute: 'foo',
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
            describe('#addCustomNode', () => {
                it('should call prop method "setNode" with state.customNode and true', () => {
                    const props = getProps({
                        setNode: jest.fn(),
                    });

                    const wrapper = shallow(<AddCustomNode {...props} />);
                    const instance = wrapper.instance();

                    wrapper.setState({ customNode: 'foo' });
                    instance.addCustomNode();

                    expect(props.setNode).toHaveBeenCalledWith(...['foo', true]);
                });
            });
        });
    });
});
