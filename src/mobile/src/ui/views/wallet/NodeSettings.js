import map from 'lodash/map';
import omit from 'lodash/omit';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import {
    setFullNode,
    updateQuorumConfig,
    updateNodeAutoSwitchSetting,
    updateAutoNodeListSetting,
} from 'shared-modules/actions/settings';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import { MINIMUM_QUORUM_SIZE, MAXIMUM_QUORUM_SIZE } from 'shared-modules/config';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { renderSettingsRows } from 'ui/components/SettingsContent';

const defaultState = {
    autoNodeList: true,
    nodeAutoSwitch: true,
    quorumEnabled: true,
    quorumSize: '4',
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
        updateAutoNodeListSetting: PropTypes.func.isRequired,
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
        };
        this.state.autoNodeManagement = this.hasDefaultNodeSettings();
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NodeSettings');
    }

    componentWillReceiveProps(newProps) {
        if (isEqual(this.state.node && this.props.node) && !isEqual(this.props.node, newProps.node)) {
            this.setState({ node: newProps.node });
        }
    }

    onApplyPress() {
        const { t } = this.props;
        const { quorumSize, autoNodeList, nodeAutoSwitch, quorumEnabled, node } = this.state;

        if (autoNodeList !== this.props.autoNodeList) {
            this.props.updateAutoNodeListSetting(autoNodeList);
        }
        if (nodeAutoSwitch !== this.props.nodeAutoSwitch) {
            this.props.updateNodeAutoSwitchSetting(nodeAutoSwitch);
        }
        if (quorumEnabled !== this.props.quorumEnabled || quorumSize !== this.props.quorumSize) {
            this.props.updateQuorumConfig({ enabled: quorumEnabled, size: parseInt(quorumSize) });
        }
        if (!isEqual(omit(node, 'custom'), omit(this.props.node, 'custom'))) {
            return this.props.setFullNode(node);
        }
        this.props.generateAlert(
            'success',
            t('nodeSettings:nodeSettingsUpdatedTitle'),
            t('nodeSettings:nodeSettingsUpdatedExplanation'),
        );
    }

    getQuorumOptions() {
        const { autoNodeList } = this.state;
        const { nodes, customNodes } = this.props;
        const nodeList = autoNodeList ? [...nodes, ...customNodes] : customNodes;
        return Array(Math.min(nodeList.length, MAXIMUM_QUORUM_SIZE))
            .fill()
            .map((_, idx) => (MINIMUM_QUORUM_SIZE + idx).toString());
    }

    haveNodeSettingsChanged() {
        const { autoNodeList, nodeAutoSwitch, quorumEnabled, quorumSize, node } = this.props;
        return isEqual(
            { autoNodeList, nodeAutoSwitch, quorumEnabled, quorumSize, node: omit(node, 'custom') },
            omit(omit(this.state, 'node.custom'), 'autoNodeManagement'),
        );


    }

    hasDefaultNodeSettings() {
        return isEqual(defaultState, omit(this.state, ['node', 'autoNodeManagement']));
    }

    toggleQuorumEnabled() {
        const { t, customNodes, nodes } = this.props;
        const { quorumEnabled, autoNodeList, quorumSize } = this.state;
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
        if (!quorumEnabled && !autoNodeList && quorumSize > customNodes.length) {
            this.setState({ quorumSize: customNodes.length.toString() });
        }
        this.setState({ quorumEnabled: !quorumEnabled });
    }

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

    toggleAutomaticNodeManagement() {
        if (!this.hasDefaultNodeSettings()) {
            this.setState(defaultState);
        }
        this.setState({ autoNodeManagement: !this.state.autoNodeManagement });
    }

    /**
     * Render setting rows
     *
     * @method renderSettingsContent
     * @returns {function}
     */
    renderSettingsContent() {
        const { theme, t, nodes, customNodes, isChangingNode, loginRoute } = this.props;
        const { autoNodeManagement, autoNodeList, nodeAutoSwitch, quorumEnabled, quorumSize, node } = this.state;
        const availableNodes = autoNodeList ? [...customNodes, ...nodes] : customNodes;
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
            { name: 'separator' },
            {
                name: t('nodeSettings:autoNodeList'),
                function: () => {
                    !autoNodeManagement && this.toggleAutoNodeList();
                },
                toggle: autoNodeList,
                inactive: autoNodeManagement,
            },
            { name: 'separator', inactive: autoNodeManagement },
            {
                name: t('nodeSettings:nodeAutoswitching'),
                function: () => {
                    !autoNodeManagement && this.setState({ nodeAutoSwitch: !nodeAutoSwitch });
                },
                toggle: nodeAutoSwitch,
                inactive: autoNodeManagement,
            },
            {
                name: t('nodeSettings:primaryNode'),
                function: (nodeURL) =>
                    this.setState({
                        node: find(nodes, (node) => {
                            return node.url === nodeURL;
                        }),
                    }),
                inactive: autoNodeManagement || nodeAutoSwitch,
                currentSetting: node.url,
                dropdownOptions: map(availableNodes, (node) => node.url),
            },
            { name: 'separator', inactive: autoNodeManagement },
            {
                name: t('nodeSettings:enableQuorum'),
                function: () => {
                    !autoNodeManagement && this.toggleQuorumEnabled();
                },
                toggle: quorumEnabled,
                inactive: autoNodeManagement,
            },
            {
                name: t('nodeSettings:quorumSize'),
                function: (quorumSize) => {
                    quorumSize && this.setState({ quorumSize });
                },
                inactive: autoNodeManagement || !quorumEnabled,
                dropdownOptions: this.getQuorumOptions(),
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
    node: state.settings.node,
    nodes: state.settings.nodes,
    customNodes: state.settings.customNodes,
    nodeAutoSwitch: state.settings.nodeAutoSwitch,
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
    updateAutoNodeListSetting,
    setFullNode,
    setLoginRoute,
};

export default withNamespaces(['advancedSettings', 'nodeSettings', 'settings', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(NodeSettings),
);
