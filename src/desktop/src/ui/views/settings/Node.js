import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import withNodeData from 'containers/settings/Node';

import Button from 'ui/components/Button';
import Select from 'ui/components/input/Select';
import Text from 'ui/components/input/Text';
import Checkbox from 'ui/components/Checkbox';

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
        autoNodeSwitching: PropTypes.bool.isRequired,
        /** @ignore */
        setAutoNodeSwitching: PropTypes.func.isRequired,
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

    validNode = (node) => {
        return node.length > 0;
    };

    changeCustomNode = (val) => {
        this.setState({ customNode: val });
    };

    toggleAutoNodeSwitching = () => {
        this.props.setAutoNodeSwitching();
    };

    changeSelectedNode = (e) => {
        this.setState({ selection: e.target.value });
    };

    changeNode = (e) => {
        e.preventDefault();
        const { setNode } = this.props;
        const { selection, customNode } = this.state;
        setNode(this.validNode(customNode) ? customNode : selection, this.validNode(customNode));
        this.setState({ customNode: '' });
    };

    removeNode = () => {
        this.props.removeCustomNode(this.state.selection || this.props.node);
        this.setState({
            selection: null,
        });
    };

    render() {
        const { nodes, customNodes, node, loading, autoNodeSwitching, t } = this.props;
        const { selection, customNode } = this.state;

        const selectedNode = this.validNode(customNode) ? customNode : selection;

        return (
            <form onSubmit={this.changeNode}>
                <Select
                    value={selection || node}
                    label={t('node')}
                    disabled={this.validNode(customNode)}
                    onChange={this.changeSelectedNode}
                >
                    {nodes.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </Select>

                <Text value={customNode} label={t('addCustomNode:customNode')} onChange={this.changeCustomNode} />

                <Checkbox
                    checked={autoNodeSwitching}
                    onChange={this.toggleAutoNodeSwitching}
                    label={t('settings:autoNodeSwitching')}
                />

                <fieldset>
                    <Button type="submit" loading={loading} disabled={!selectedNode || selectedNode === node}>
                        {t('save')}
                    </Button>
                    {selection !== node &&
                        customNodes.indexOf(selection) > -1 && (
                            <Button onClick={this.removeNode} variant="negative">
                                {t('addCustomNode:removeCustomNode')}
                            </Button>
                        )}
                </fieldset>
            </form>
        );
    }
}

export default withNodeData(SetNode);
