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
        /** Current node */
        node: PropTypes.string.isRequired,
        /** Available nodes list */
        nodes: PropTypes.array.isRequired,
        /** Node validity check statuss */
        loading: PropTypes.bool.isRequired,
        /** Set new node
         * @param {string} url - Node url
         */
        setNode: PropTypes.func.isRequired,
        /** Auto node switching enabled
         * @ignore
         */
        autoNodeSwitching: PropTypes.bool.isRequired,
        /**
         * Update the auto node switching state
         * @ignore
         */
        setAutoNodeSwitching: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        selection: null,
        customNode: '',
    };

    validNode = (node) => {
        return node.length > 0;
    };

    render() {
        const { nodes, node, loading, setNode, autoNodeSwitching, setAutoNodeSwitching, t } = this.props;
        const { selection, customNode } = this.state;

        const selectedNode = this.validNode(customNode) ? customNode : selection;

        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setNode(selectedNode);
                    this.setState({
                        customNode: '',
                    });
                }}
            >
                <Select
                    value={selection || node}
                    label={t('node')}
                    disabled={this.validNode(customNode)}
                    onChange={(e) => this.setState({ selection: e.target.value })}
                >
                    {nodes.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </Select>

                <Text
                    value={customNode}
                    label={t('addCustomNode:customNode')}
                    onChange={(value) => this.setState({ customNode: value })}
                />

                <Checkbox
                    checked={autoNodeSwitching} onChange={() => setAutoNodeSwitching()}
                    label={t('settings:autoNodeSwitching')}
                />

                <fieldset>
                    <Button type="submit" loading={loading} disabled={!selectedNode || selectedNode === node}>
                        {t('save')}
                    </Button>
                </fieldset>
            </form>
        );
    }
}

export default withNodeData(SetNode);
