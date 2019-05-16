import endsWith from 'lodash/endsWith';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import {
    setFullNode,
    removeCustomNode,
    updateQuorumConfig,
    updateAutoNodeSwitching,
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
            node: PropTypes.string.isRequired,
            nodes: PropTypes.array.isRequired,
            customNodes: PropTypes.array.isRequired,
            isChangingNode: PropTypes.bool.isRequired,
            isCheckingCustomNode: PropTypes.bool.isRequired,
            setFullNode: PropTypes.func.isRequired,
            removeCustomNode: PropTypes.func.isRequired,
            autoNodeSwitching: PropTypes.bool.isRequired,
            autoNodeSelection: PropTypes.bool.isRequired,
            updateQuorumConfig: PropTypes.func.isRequired,
            updateAutoNodeSwitching: PropTypes.func.isRequired,
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

            if (!nodeSelected) {
                generateAlert('error', t('addCustomNode:nodeFieldEmpty'), t('addCustomNode:nodeFieldEmptyExplanation'));
                return;
            }

            // Remove spaces and trailing slash
            nodeSelected = nodeSelected.replace(/ /g, '').replace(/\/$/, '');

            // Check if URL is valid
            if (!isValidUrl(nodeSelected)) {
                generateAlert('error', t('addCustomNode:customNodeCouldNotBeAdded'), t('addCustomNode:invalidURL'));
                return;
            }

            // Only allow HTTPS nodes
            if (!isValidHttpsUrl(nodeSelected)) {
                generateAlert('error', t('nodeMustUseHTTPS'), t('nodeMustUseHTTPSExplanation'));
                return;
            }

            const hasDefaultHttpsPort = endsWith(nodeSelected, ':443');

            if (hasDefaultHttpsPort) {
                nodeSelected = nodeSelected.slice(0, -4);
            }

            // Check whether the node was already added to the list
            if (
                customNode &&
                (nodes.includes(nodeSelected) ||
                    nodes.map((node) => (endsWith(node, ':443') ? node.slice(0, -4) : node)).includes(nodeSelected))
            ) {
                generateAlert('error', t('nodeDuplicated'), t('nodeDuplicatedExplanation'));
                return;
            }

            if (nodeSelected === node) {
                return;
            }

            setFullNode(nodeSelected, nodes.indexOf(nodeSelected) < 0);
        };

        render() {
            const {
                node,
                nodes,
                customNodes,
                autoNodeList,
                removeCustomNode,
                backPress,
                isChangingNode,
                isCheckingCustomNode,
                theme,
                autoNodeSwitching,
                autoNodeSelection,
                updateQuorumConfig,
                updateAutoNodeSwitching,
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
                removeCustomNode,
                setAutoNodeSwitching: this.changeAutoNodeSwitching,
                settings: {
                    node,
                    autoNodeSwitching,
                    autoNodeSelection,
                    autoNodeList,
                    quorumEnabled,
                    quorumSize,
                },
                actions: {
                    updateAutoNodeListSetting,
                    updateAutoNodeSwitching,
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
        autoNodeSwitching: state.settings.autoNodeSwitching,
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
        updateAutoNodeSwitching,
        updateQuorumConfig,
        updateAutoNodeListSetting,
    };

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(NodeData));
}
