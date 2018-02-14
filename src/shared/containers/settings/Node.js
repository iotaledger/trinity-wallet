import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { changeIotaNode, checkNode } from '../../libs/iota';
import { setFullNode, addCustomPoWNode } from '../../actions/settings';
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

                generateAlert('success', 'Node changed', 'The node has been changed successfully!');

                if (typeof backPress === 'function') {
                    backPress();
                }
            });
        };

        render() {
            const { node, nodes, backPress, theme, t } = this.props;

            const currencyProps = {
                node: node,
                nodes: nodes,
                loading: this.state.loading,
                setNode: this.changeNode,
                backPress: backPress,
                theme,
                t,
            };

            return <NodeComponent {...currencyProps} />;
        }
    }

    NodeData.displayName = `withNodeData(${NodeComponent.name})`;

    const mapStateToProps = (state) => ({
        node: state.settings.fullNode,
        nodes: state.settings.availablePoWNodes,
        theme: state.settings.theme,
    });

    const mapDispatchToProps = {
        setFullNode,
        addCustomPoWNode,
        generateAlert,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(NodeData));
}
