import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import PropTypes from 'prop-types';
import { shallow } from 'enzyme';
import { AdvancedSettings } from 'ui/views/wallet/AdvancedSettings';

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

jest.mock('react-native-camera', () => {});
jest.mock('rn-fetch-blob', () => {});

jest.mock('rn-fetch-blob', () => {});

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
