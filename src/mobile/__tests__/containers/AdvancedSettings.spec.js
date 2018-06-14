import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { AdvancedSettings } from '../../containers/AdvancedSettings';

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            setSetting: noop,
            t: () => '',
            generateAlert: noop,
            node: 'https://foo.baz',
            theme: { body: {} },
            isSendingTransfer: false,
            navigator: {},
        },
        overrides,
    );

describe('Testing AdvancedSettings component', () => {
    describe('propTypes', () => {
        it('should require a setSetting function as a prop', () => {
            expect(AdvancedSettings.propTypes.setSetting).toEqual(PropTypes.func.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(AdvancedSettings.propTypes.t).toEqual(PropTypes.func.isRequired);
        });

        it('should require a generateAlert function as a prop', () => {
            expect(AdvancedSettings.propTypes.generateAlert).toEqual(PropTypes.func.isRequired);
        });

        it('should require a node string as a prop', () => {
            expect(AdvancedSettings.propTypes.node).toEqual(PropTypes.string.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(AdvancedSettings.propTypes.theme).toEqual(PropTypes.object.isRequired);
        });

        it('should require a isSendingTransfer boolean as a prop', () => {
            expect(AdvancedSettings.propTypes.isSendingTransfer).toEqual(PropTypes.bool.isRequired);
        });

        it('should require a navigator object as a prop', () => {
            expect(AdvancedSettings.propTypes.navigator).toEqual(PropTypes.object.isRequired);
        });
    });

    describe('when renders', () => {
        it('should not explode', () => {
            const props = getProps();

            const wrapper = shallow(<AdvancedSettings {...props} />);
            expect(wrapper.name()).toEqual('View');
        });
    });

    describe('instance methods', () => {
        describe('when called', () => {
            describe('#onNodeSelection', () => {
                it('should call prop method "setSetting" with "nodeSelection" if "isSendingTransfer" is false', () => {
                    const props = getProps({
                        setSetting: jest.fn(),
                    });

                    const instance = shallow(<AdvancedSettings {...props} />).instance();
                    instance.onNodeSelection();

                    expect(props.setSetting).toHaveBeenCalledWith('nodeSelection');
                });

                it('should not call prop method "setSetting" if "isSendingTransfer" is true', () => {
                    const props = getProps({
                        setSetting: jest.fn(),
                        isSendingTransfer: true,
                    });

                    const instance = shallow(<AdvancedSettings {...props} />).instance();
                    instance.onNodeSelection();

                    expect(props.setSetting).toHaveBeenCalledTimes(0);
                });
            });

            describe('#onAddCustomNode', () => {
                it('should call prop method "setSetting" with "addCustomNode" if "isSendingTransfer" is false', () => {
                    const props = getProps({
                        setSetting: jest.fn(),
                    });

                    const instance = shallow(<AdvancedSettings {...props} />).instance();
                    instance.onAddCustomNode();

                    expect(props.setSetting).toHaveBeenCalledWith('addCustomNode');
                });

                it('should not call prop method "setSetting" if "isSendingTransfer" is true', () => {
                    const props = getProps({
                        setSetting: jest.fn(),
                        isSendingTransfer: true,
                    });

                    const instance = shallow(<AdvancedSettings {...props} />).instance();
                    instance.onAddCustomNode();

                    expect(props.setSetting).toHaveBeenCalledTimes(0);
                });
            });
        });
    });
});
