import endsWith from 'lodash/endsWith';
import some from 'lodash/some';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import {
    setFullNode,
    removeCustomNode,
    updateQuorumConfig,
    updateNodeAutoSwitchSetting,
    updateAutoNodeListSetting,
} from '../../actions/settings';
import { generateAlert } from '../../actions/alerts';
import { isValidUrl, isValidHttpsUrl } from '../../libs/utils';

import { getThemeFromState } from '../../selectors/global';

/**
 * Node settings container
 * @ignore
 */
export default function withNodeData(NodeComponent) {
    class NodeData extends React.Component {
        static propTypes = {
            node: PropTypes.object.isRequired,
            nodes: PropTypes.array.isRequired,
            customNodes: PropTypes.array.isRequired,
            isChangingNode: PropTypes.bool.isRequired,
            isCheckingCustomNode: PropTypes.bool.isRequired,
            setFullNode: PropTypes.func.isRequired,
            removeCustomNode: PropTypes.func.isRequired,
            nodeAutoSwitch: PropTypes.bool.isRequired,
            autoNodeSelection: PropTypes.bool.isRequired,
            updateQuorumConfig: PropTypes.func.isRequired,
            updateNodeAutoSwitchSetting: PropTypes.func.isRequired,
            updateAutoNodeListSetting: PropTypes.func.isRequired,
            generateAlert: PropTypes.func.isRequired,
            quorumEnabled: PropTypes.bool.isRequired,
            quorumSize: PropTypes.number.isRequired,
            autoNodeList: PropTypes.bool.isRequired,
            backPress: PropTypes.func,
            onClose: PropTypes.func,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
        };

        changeNode = (nodeSelected, customNode) => {
            const { nodes, node, setFullNode, generateAlert, t } = this.props;

            if (!nodeSelected.url) {
                generateAlert('error', t('addCustomNode:nodeFieldEmpty'), t('addCustomNode:nodeFieldEmptyExplanation'));
                return;
            }

            // Remove spaces and trailing slash
            nodeSelected.url = nodeSelected.url.replace(/ /g, '').replace(/\/$/, '');

            // Check if URL is valid
            if (!isValidUrl(nodeSelected.url)) {
                generateAlert('error', t('addCustomNode:customNodeCouldNotBeAdded'), t('addCustomNode:invalidURL'));
                return;
            }

            // Only allow HTTPS nodes
            if (!isValidHttpsUrl(nodeSelected.url)) {
                generateAlert('error', t('nodeMustUseHTTPS'), t('nodeMustUseHTTPSExplanation'));
                return;
            }

            const hasDefaultHttpsPort = endsWith(nodeSelected.url, ':443');

            if (hasDefaultHttpsPort) {
                nodeSelected.url = nodeSelected.url.slice(0, -4);
            }

            // Check whether the node was already added to the list
            if (
                customNode &&
                some(nodes, ({ url }) => (endsWith(url, ':443') ? url.slice(0, -4) : url)
                    .match(nodeSelected.url))
            ) {
                generateAlert('error', t('nodeDuplicated'), t('nodeDuplicatedExplanation'));
                return;
            }

            if (nodeSelected.url === node.url) {
                return;
            }

            setFullNode(nodeSelected, customNode);
        };

        removeCustomNode = (nodeUrl) => {
            const { t, autoNodeList, customNodes, quorumEnabled, quorumSize } = this.props;
            if (!autoNodeList && quorumEnabled && quorumSize === customNodes.length) {
                return this.props.generateAlert('error', t('addCustomNode:couldNotRemove'), t('addCustomNode:couldNotRemoveExplanation'), 10000);
            }
            this.props.removeCustomNode(nodeUrl);
        }

        render() {
            const {
                node,
                nodes,
                customNodes,
                autoNodeList,
                backPress,
                isChangingNode,
                isCheckingCustomNode,
                theme,
                nodeAutoSwitch,
                autoNodeSelection,
                updateQuorumConfig,
                updateNodeAutoSwitchSetting,
                quorumEnabled,
                generateAlert,
                quorumSize,
                onClose,
                updateAutoNodeListSetting,
                setFullNode,
                t,
            } = this.props;

            const nodeProps = {
                nodes,
                customNodes,
                loading: isChangingNode || isCheckingCustomNode,
                setNode: this.changeNode,
                removeCustomNode: this.removeCustomNode,
                settings: {
                    node,
                    nodeAutoSwitch,
                    autoNodeSelection,
                    autoNodeList,
                    quorumEnabled,
                    quorumSize,
                },
                actions: {
                    updateAutoNodeListSetting,
                    updateNodeAutoSwitchSetting,
                    updateQuorumConfig,
                    setFullNode,
                },
                backPress,
                generateAlert,
                onClose,
                theme,
                t,
            };

            return <NodeComponent {...nodeProps} />;
        }
    }

    NodeData.displayName = `withNodeData(${NodeComponent.name})`;

    const mapStateToProps = (state) => ({
        node: state.settings.node,
        nodes: state.settings.nodes,
        customNodes: state.settings.customNodes,
        theme: getThemeFromState(state),
        nodeAutoSwitch: state.settings.nodeAutoSwitch,
        autoNodeSelection: false,
        isChangingNode: state.ui.isChangingNode,
        isCheckingCustomNode: state.ui.isCheckingCustomNode,
        autoNodeList: state.settings.autoNodeList,
        quorumSize: state.settings.quorum.size,
        quorumEnabled: state.settings.quorum.enabled,
    });

    const mapDispatchToProps = {
        setFullNode,
        removeCustomNode,
        generateAlert,
        updateNodeAutoSwitchSetting,
        updateQuorumConfig,
        updateAutoNodeListSetting,
    };

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(NodeData));
}
