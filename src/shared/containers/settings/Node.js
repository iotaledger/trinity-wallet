import endsWith from 'lodash/endsWith';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { setFullNode, removeCustomNode, updateAutoNodeSwitching } from '../../actions/settings';
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
            updateAutoNodeSwitching: PropTypes.func.isRequired,
            generateAlert: PropTypes.func.isRequired,
            backPress: PropTypes.func,
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

        changeAutoNodeSwitching = () => {
            this.props.updateAutoNodeSwitching();
        };

        render() {
            const {
                node,
                nodes,
                customNodes,
                removeCustomNode,
                backPress,
                isChangingNode,
                isCheckingCustomNode,
                theme,
                autoNodeSwitching,
                t,
            } = this.props;

            const nodeProps = {
                node,
                nodes,
                customNodes,
                loading: isChangingNode || isCheckingCustomNode,
                setNode: this.changeNode,
                removeCustomNode,
                autoNodeSwitching: autoNodeSwitching,
                setAutoNodeSwitching: this.changeAutoNodeSwitching,
                backPress: backPress,
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
        isChangingNode: state.ui.isChangingNode,
        isCheckingCustomNode: state.ui.isCheckingCustomNode,
    });

    const mapDispatchToProps = {
        setFullNode,
        removeCustomNode,
        generateAlert,
        updateAutoNodeSwitching,
    };

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(NodeData));
}
