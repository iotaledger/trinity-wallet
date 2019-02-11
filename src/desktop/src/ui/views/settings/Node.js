import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import withNodeData from 'containers/settings/Node';

import Button from 'ui/components/Button';
import Select from 'ui/components/input/Select';
import Text from 'ui/components/input/Text';

/**
 * Change IRI API node component
 */
class SetNode extends PureComponent {
    static propTypes = {
        /** @ignore */
        node: PropTypes.string.isRequired,
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** @ignore */
        customNodes: PropTypes.array.isRequired,
        /** @ignore */
        loading: PropTypes.bool.isRequired,
        /** @ignore */
        setNode: PropTypes.func.isRequired,
        /** @ignore */
        removeCustomNode: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        selection: null,
        customNode: '',
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.loading && !nextProps.loading) {
            this.setState({
                selection: null,
                customNode: '',
            });
        }
    }

    changeCustomNode = (val) => {
        this.setState({ customNode: val });
    };

    changeSelectedNode = (value) => {
        this.setState({ selection: value });
    };

    changeNode = (e) => {
        e.preventDefault();
        const { setNode } = this.props;
        const { selection, customNode } = this.state;
        setNode(customNode.length > 0 ? customNode : selection, customNode.length > 0);
        this.setState({ customNode: '' });
    };

    removeNode = () => {
        this.props.removeCustomNode(this.state.selection || this.props.node);
        this.setState({
            selection: null,
        });
    };

    render() {
        const { nodes, customNodes, node, loading, t } = this.props;
        const { selection, customNode } = this.state;

        const selectedNode = customNode.length > 0 ? customNode : selection;

        return (
            <form onSubmit={this.changeNode}>
                <fieldset>
                    <Select
                        value={selection || node}
                        label={t('node')}
                        disabled={customNode.length > 0}
                        onChange={this.changeSelectedNode}
                        options={nodes.map((item) => {
                            return { value: item, label: item };
                        })}
                    />

                    <Text value={customNode} label={t('addCustomNode:customNode')} onChange={this.changeCustomNode} />
                </fieldset>
                <footer>
                    <Button
                        className="square"
                        type="submit"
                        loading={loading}
                        disabled={!selectedNode || selectedNode === node}
                    >
                        {t('save')}
                    </Button>
                    {selection !== node &&
                        customNodes.indexOf(selection) > -1 && (
                            <Button className="square" onClick={this.removeNode} variant="negative">
                                {t('addCustomNode:removeCustomNode')}
                            </Button>
                        )}
                </footer>
            </form>
        );
    }
}

export default withNodeData(SetNode);
