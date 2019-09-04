import map from 'lodash/map';
import omit from 'lodash/omit';
import find from 'lodash/find';
import get from 'lodash/get';
import sample from 'lodash/sample';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import unionBy from 'lodash/unionBy';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import {
    setFullNode,
    updateQuorumConfig,
    updateNodeAutoSwitchSetting,
    changeAutoNodeListSetting,
    setPowNode,
    changePowSettings,
    updatePowNodeAutoSwitchSetting,
} from 'shared-modules/actions/settings';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import { DEFAULT_NODE, MINIMUM_QUORUM_SIZE, MAXIMUM_QUORUM_SIZE, QUORUM_SIZE } from 'shared-modules/config';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { renderSettingsRows } from 'ui/components/SettingsContent';

const defaultState = {
    autoNodeList: true,
    nodeAutoSwitch: true,
    quorumEnabled: true,
    quorumSize: QUORUM_SIZE.toString(),
    powNodeAutoSwitch: true,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

/**
 * Advanced Settings component
 */
export class NodeSettings extends PureComponent {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        node: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** @ignore */
        customNodes: PropTypes.array.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateQuorumConfig: PropTypes.func.isRequired,
        /** @ignore */
        updateNodeAutoSwitchSetting: PropTypes.func.isRequired,
        /** @ignore */
        changeAutoNodeListSetting: PropTypes.func.isRequired,
        /** @ignore */
        updatePowNodeAutoSwitchSetting: PropTypes.func.isRequired,
        /** @ignore */
        setPowNode: PropTypes.func.isRequired,
        /** @ignore */
        changePowSettings: PropTypes.func.isRequired,
        /** @ignore */
        powNode: PropTypes.string.isRequired,
        /** @ignore */
        remotePoW: PropTypes.bool.isRequired,
        /** @ignore */
        powNodeAutoSwitch: PropTypes.bool.isRequired,
        /** @ignore */
        autoNodeList: PropTypes.bool.isRequired,
        /** @ignore */
        nodeAutoSwitch: PropTypes.bool.isRequired,
        /** @ignore */
        quorumEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        quorumSize: PropTypes.string.isRequired,
        /** @ignore */
        setFullNode: PropTypes.func.isRequired,
        /** @ignore */
        isChangingNode: PropTypes.bool.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
        /** @ignore */
        loginRoute: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            autoNodeList: props.autoNodeList,
            nodeAutoSwitch: props.nodeAutoSwitch,
            quorumEnabled: props.quorumEnabled,
            quorumSize: props.quorumSize,
            node: props.node,
            powNode: props.powNode,
            powNodeAutoSwitch: props.powNodeAutoSwitch,
            remotePoW: props.remotePoW,
        };
        this.state.autoNodeManagement = this.hasDefaultNodeSettings();
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NodeSettings');
    }

    componentWillReceiveProps(newProps) {
        if (!isEqual(this.props.node, newProps.node)) {
            this.setState({ node: newProps.node });
        }
    }

    onApplyPress() {
        const { t } = this.props;
        const {
            quorumSize,
            autoNodeList,
            nodeAutoSwitch,
            quorumEnabled,
            node,
            powNode,
            remotePoW,
            powNodeAutoSwitch,
        } = this.state;

        if (autoNodeList !== this.props.autoNodeList) {
            this.props.changeAutoNodeListSetting(autoNodeList);
        }
        if (nodeAutoSwitch !== this.props.nodeAutoSwitch) {
            this.props.updateNodeAutoSwitchSetting(nodeAutoSwitch);
        }
        if (quorumEnabled !== this.props.quorumEnabled || quorumSize !== this.props.quorumSize) {
            this.props.updateQuorumConfig({ enabled: quorumEnabled, size: parseInt(quorumSize) });
        }
        if (powNode !== this.props.powNode) {
            this.props.setPowNode(powNode);
        }
        if (remotePoW !== this.props.remotePoW) {
            this.props.changePowSettings();
        }
        if (powNodeAutoSwitch !== this.props.powNodeAutoSwitch) {
            this.props.updatePowNodeAutoSwitchSetting(powNodeAutoSwitch);
        }
        if (!isEqual(node, this.props.node)) {
            return this.props.setFullNode(node);
        }

        this.props.generateAlert(
            'success',
            t('nodeSettings:nodeSettingsUpdatedTitle'),
            t('nodeSettings:nodeSettingsUpdatedExplanation'),
        );
    }

    /**
     * Returns active node list
     *
     * @method getAvailableNodes
     *
     * @returns {array}
     */
    getAvailableNodes(pow = false) {
        const { nodes, customNodes } = this.props;
        const { autoNodeList } = this.state;
        const availableNodes = unionBy(customNodes, autoNodeList && nodes, [DEFAULT_NODE], 'url');
        if (pow) {
            return availableNodes.filter(({ pow }) => pow);
        }
        return availableNodes;
    }

    /**
     * Returns possible quorum sizes in accordance with current settings
     *
     * @method getQuorumSizeOptions
     *
     * @returns {array}
     */
    getQuorumSizeOptions() {
        const maxQuorumSize = Math.min(this.getAvailableNodes().length, MAXIMUM_QUORUM_SIZE);
        return this.getAvailableNodes().length < MINIMUM_QUORUM_SIZE
            ? []
            : Array(maxQuorumSize - MINIMUM_QUORUM_SIZE + 1)
                  .fill()
                  .map((_, idx) => (MINIMUM_QUORUM_SIZE + idx).toString());
    }

    /**
     * Determines whether the user has adjusted the node settings from their initial state
     *
     * @method haveNodeSettingsChanged
     *
     * @returns {bool}
     */
    haveNodeSettingsChanged() {
        const {
            autoNodeList,
            nodeAutoSwitch,
            quorumEnabled,
            quorumSize,
            node,
            powNode,
            powNodeAutoSwitch,
            remotePoW,
        } = this.props;
        return isEqual(
            { autoNodeList, nodeAutoSwitch, quorumEnabled, quorumSize, node, powNode, powNodeAutoSwitch, remotePoW },
            omit(this.state, ['autoNodeManagement']),
        );
    }

    /**
     * Determines whether the node settings in state match the default values (i.e. those values when automatic node management is on)
     *
     * @method hasDefaultNodeSettings
     *
     * @returns {bool}
     */
    hasDefaultNodeSettings() {
        return isEqual(defaultState, omit(this.state, ['node', 'autoNodeManagement', 'powNode', 'remotePoW']));
    }

    /**
     * Toggles quorum activity, adjusting quorum size if necessary
     *
     * @method toggleQuorumEnabled
     */
    toggleQuorumEnabled() {
        const { t, customNodes, nodes } = this.props;
        const { quorumEnabled, autoNodeList } = this.state;
        if (
            !quorumEnabled &&
            ((autoNodeList && nodes.length < MINIMUM_QUORUM_SIZE) ||
                (!autoNodeList && customNodes.length < MINIMUM_QUORUM_SIZE))
        ) {
            return this.props.generateAlert(
                'error',
                t('nodeSettings:nodeEnoughNodesTitle'),
                autoNodeList
                    ? t('nodeSettings:nodeEnoughNodesExplanation')
                    : `${t('nodeSettings:nodeEnoughNodesExplanation')} ${t(
                          'nodeSettings:nodeEnoughNodesExplanationCustomNodes',
                      )}`,
            );
        }

        if (!quorumEnabled) {
            this.setState({ quorumSize: Math.min(this.getAvailableNodes().length, QUORUM_SIZE).toString() });
        }
        this.setState({ quorumEnabled: !quorumEnabled });
    }

    /**
     * Toggles auto node list and adjusts quorum settings if there aren't enough quorum nodes
     *
     * @method toggleAutoNodeList
     */
    toggleAutoNodeList() {
        const { autoNodeList } = this.state;
        const { t, customNodes, quorumSize } = this.props;
        if (autoNodeList && isEmpty(customNodes)) {
            return this.props.generateAlert(
                'error',
                t('nodeSettings:noCustomNodes'),
                t('nodeSettings:mustAddCustomNodes'),
            );
        }
        if (autoNodeList && customNodes.length < MINIMUM_QUORUM_SIZE) {
            this.setState({ quorumEnabled: false });
        } else if (autoNodeList && customNodes.length < quorumSize) {
            this.setState({ quorumSize: customNodes.length.toString() });
        }
        this.setState({ autoNodeList: !autoNodeList });
    }

    /**
     * Toggles automatic node management i.e. resets to default settings when turned on
     *
     * @method toggleAutomaticNodeManagement
     */
    toggleAutomaticNodeManagement() {
        if (!this.hasDefaultNodeSettings()) {
            this.setState(defaultState);
        }
        this.setState((prevState) => ({ autoNodeManagement: !prevState.autoNodeManagement }));
    }

    /**
     * Toggles proof of work between local and remote and sets node to outsource to
     *
     * @method togglePowNodeAutoSwitch
     */
    togglePowNodeAutoSwitch() {
        const { powNodeAutoSwitch } = this.state;
        this.setState({ powNode: this.props.powNode || get(sample(this.getAvailableNodes(true)), 'url') });
        this.setState({ powNodeAutoSwitch: !powNodeAutoSwitch });
    }

    /**
     * Render setting rows
     *
     * @method renderSettingsContent
     * @returns {function}
     */
    renderSettingsContent() {
        const { theme, t, isChangingNode, loginRoute } = this.props;
        const {
            autoNodeManagement,
            autoNodeList,
            nodeAutoSwitch,
            quorumEnabled,
            quorumSize,
            node,
            powNode,
            remotePoW,
            powNodeAutoSwitch,
        } = this.state;

        const rows = [
            {
                name: t('nodeSettings:automaticNodeManagement'),
                function: () => this.toggleAutomaticNodeManagement(),
                toggle: autoNodeManagement,
            },
            {
                name: t('nodeSettings:addCustomNodes'),
                function: () =>
                    loginRoute === 'nodeSettings'
                        ? this.props.setLoginRoute('addCustomNode')
                        : this.props.setSetting('addCustomNode'),
            },
            {
                name: t('nodeSettings:outsourcePow'),
                function: () => this.setState({ remotePoW: !remotePoW }),
                toggle: remotePoW,
            },
            { name: 'separator', hidden: autoNodeManagement },
            {
                name: t('nodeSettings:autoNodeList'),
                function: () => this.toggleAutoNodeList(),
                toggle: autoNodeList,
                hidden: autoNodeManagement,
            },
            {
                name: t('nodeSettings:nodeAutoswitching'),
                function: () => this.setState({ nodeAutoSwitch: !nodeAutoSwitch }),
                toggle: nodeAutoSwitch,
                hidden: autoNodeManagement,
            },
            {
                name: t('nodeSettings:primaryNode'),
                function: (nodeURL) =>
                    this.setState({
                        node: find(this.getAvailableNodes(), (node) => {
                            return get(node, 'url') === nodeURL;
                        }),
                    }),
                currentSetting: get(node, 'url'),
                hidden: autoNodeManagement || nodeAutoSwitch,
                dropdownOptions: map(this.getAvailableNodes(), (node) => node.url),
            },
            {
                name: t('nodeSettings:autoSelectPowNode'),
                function: () => this.togglePowNodeAutoSwitch(),
                toggle: powNodeAutoSwitch,
                hidden: autoNodeManagement || !remotePoW,
            },
            {
                name: t('nodeSettings:nodeForPow'),
                function: (powNode) => this.setState({ powNode }),
                currentSetting: powNode,
                hidden: autoNodeManagement || powNodeAutoSwitch || !remotePoW,
                dropdownOptions: map(this.getAvailableNodes(true), (node) => node.url),
            },
            {
                name: t('nodeSettings:enableQuorum'),
                function: () => this.toggleQuorumEnabled(),
                toggle: quorumEnabled,
                hidden: autoNodeManagement,
            },
            {
                name: t('nodeSettings:quorumSize'),
                function: (quorumSize) => (quorumSize ? this.setState({ quorumSize }) : {}),
                hidden: autoNodeManagement || this.getAvailableNodes().length < quorumSize || !quorumEnabled,
                dropdownOptions: this.getQuorumSizeOptions(),
                currentSetting: (!quorumEnabled && '0') || quorumSize,
            },
            {
                name: 'dualFooter',
                backFunction: () =>
                    loginRoute === 'nodeSettings'
                        ? this.props.setLoginRoute('login')
                        : this.props.setSetting('advancedSettings'),
                hideActionButton: this.haveNodeSettingsChanged(),
                actionName: 'Apply',
                actionFunction: () => this.onApplyPress(),
                actionButtonLoading: isChangingNode,
            },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    node: omit(state.settings.node, 'custom'),
    nodes: map(state.settings.nodes, (node) => omit(node, 'custom')),
    customNodes: state.settings.customNodes,
    powNode: state.settings.powNode,
    remotePoW: state.settings.remotePoW,
    nodeAutoSwitch: state.settings.nodeAutoSwitch,
    powNodeAutoSwitch: state.settings.powNodeAutoSwitch,
    autoNodeList: state.settings.autoNodeList,
    quorumSize: state.settings.quorum.size.toString(),
    quorumEnabled: state.settings.quorum.enabled,
    isChangingNode: state.ui.isChangingNode,
    loginRoute: state.ui.loginRoute,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    updateQuorumConfig,
    updateNodeAutoSwitchSetting,
    changeAutoNodeListSetting,
    setFullNode,
    setLoginRoute,
    setPowNode,
    changePowSettings,
    updatePowNodeAutoSwitchSetting,
};

export default withTranslation(['advancedSettings', 'nodeSettings', 'settings', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(NodeSettings),
);
