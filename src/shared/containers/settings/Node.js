import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { changeIotaNode, checkNode} from '../../libs/iota';
import { setFullNode, addCustomPoWNode, updateAutoNodeSwitching } from '../../actions/settings';
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
            addCustomPoWNode: PropTypes.func.isRequired,
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

        changeNode = (nodeSelected) => {
            const { nodes, node, setFullNode, addCustomPoWNode, generateAlert, backPress, t } = this.props;

            if (!nodeSelected || nodeSelected.length < 4) {
                return;
            }

            // only allow HTTPS nodes
            if(nodeSelected.substring(0,8) !== "https://") {
                generateAlert('error', t('nodeMustUseHTTPS'), t('nodeMustUseHTTPSExplanation'));
                return;
            }

            //Remove trailing slash
            nodeSelected = nodeSelected.replace(/\/$/, '');

            if (nodeSelected === node) {
                return;
            }

            this.setState({
                loading: true,
            });

            // TODO: Should create a new instance of IRI API and not use existing for node check
            changeIotaNode(nodeSelected);

            try {
                checkNode((error) => {
                    this.setState({
                        loading: false,
                    });

                    if (error) {
                        generateAlert('error', t('global:invalidResponse'), t('global:invalidResponseExplanation'));
                        changeIotaNode(node);
                        return;

                    }

                    setFullNode(nodeSelected);

                    if (nodes.indexOf(nodeSelected) < 0) {
                        addCustomPoWNode(nodeSelected);
                    }

                    generateAlert('success', t('nodeChanged'), t('nodeChangedExplanation'));

                    if (typeof backPress === 'function') {
                        backPress();
                    }
                });
            } catch (err) {
                generateAlert('error',t('global:invalidResponse'), t('global:invalidResponseExplanation'));
                changeIotaNode(node);
            }
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
        addCustomPoWNode,
        generateAlert,
        updateAutoNodeSwitching,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(NodeData));
}
