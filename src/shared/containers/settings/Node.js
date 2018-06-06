import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { changeIotaNode } from '../../libs/iota';
import { getNodeInfoAsync as checkNode } from '../../libs/iota/extendedApi';
import { setFullNode, updateAutoNodeSwitching } from '../../actions/settings';
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
            setFullNode: PropTypes.func.isRequired,
            autoNodeSwitching: PropTypes.bool.isRequired,
            updateAutoNodeSwitching: PropTypes.func.isRequired,
            generateAlert: PropTypes.func.isRequired,
            backPress: PropTypes.func,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
        };

        constructor(props) {
            super(props);

            this.state = {
                loading: false,
            };
        }

        changeNode = (nodeSelected, customNode) => {
            const { nodes, node, setFullNode, generateAlert, backPress, t } = this.props;

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

            this.setState({
                loading: true,
            });

            checkNode(nodeSelected)
                .then(() => {
                    this.setState({ loading: false });
                    changeIotaNode(nodeSelected);
                    setFullNode(nodeSelected, nodes.indexOf(nodeSelected) < 0);

                    generateAlert('success', t('nodeChanged'), t('nodeChangedExplanation'));

                    if (typeof backPress === 'function') {
                        backPress();
                    }
                })
                .catch(() => {
                    this.setState({ loading: false });
                    generateAlert('error', t('global:invalidResponse'), t('global:invalidResponseExplanation'));
                });
        };

        changeAutoNodeSwitching = () => {
            this.props.updateAutoNodeSwitching();
        };

        render() {
            const { node, nodes, backPress, theme, autoNodeSwitching, t } = this.props;

            const nodeProps = {
                node: node,
                nodes: nodes,
                loading: this.state.loading,
                setNode: this.changeNode,
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
        theme: state.settings.theme,
        autoNodeSwitching: state.settings.autoNodeSwitching,
    });

    const mapDispatchToProps = {
        setFullNode,
        generateAlert,
        updateAutoNodeSwitching,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(NodeData));
}
