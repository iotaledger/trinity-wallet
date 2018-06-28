import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { setFullNode, removeCustomNode, updateAutoNodeSwitching } from '../../actions/settings';
import { generateAlert } from '../../actions/alerts';

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
                return;
            }

            // Remove spaces and trailing slash
            nodeSelected = nodeSelected.replace(/ /g, '').replace(/\/$/, '');

            // Only allow HTTPS nodes
            if (!nodeSelected.startsWith('https://')) {
                generateAlert('error', t('nodeMustUseHTTPS'), t('nodeMustUseHTTPSExplanation'));
                return;
            }

            // Check whether the node was already added to the list
            if (customNode && nodes.includes(nodeSelected)) {
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
                theme,
                autoNodeSwitching,
                t,
            } = this.props;

            const nodeProps = {
                node,
                nodes,
                customNodes,
                loading: isChangingNode,
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
        theme: state.settings.theme,
        autoNodeSwitching: state.settings.autoNodeSwitching,
        isChangingNode: state.ui.isChangingNode,
    });

    const mapDispatchToProps = {
        setFullNode,
        removeCustomNode,
        generateAlert,
        updateAutoNodeSwitching,
    };

    return translate()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(NodeData),
    );
}
