import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { renderSettingsRows } from 'ui/components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

const defaultState = {
    autoNodeSelection: true,
    autoNodeList: true,
    autoSwitching: true,
    quorum: true,
    quorumSize: '4'
};

/**
 * Advanced Settings component
 */
export class NodeSettings extends PureComponent {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        node: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** @ignore */
        customNodes: PropTypes.array.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            autoNodeSelection: true,
            autoNodeList: true,
            autoSwitching: true,
            quorum: true,
            quorumSize: '4',
            node: props.node
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NodeSettings');
    }

    getQuorumOptions() {
        const { autoNodeList } = this.state;
        const { nodes, customNodes } = this.props;

        const nodeList = autoNodeList ? nodes : customNodes;
        return Array(nodeList.length - 1).fill().map((_, idx) => (2 + idx).toString());

    }

    toggleAutoNodeList() {
        const { autoNodeList } = this.state;
        const { t, customNodes } = this.props;
        if (autoNodeList && isEmpty(customNodes)) {
            return this.props.generateAlert('error', t('nodeSettings:noCustomNodes'), t('nodeSettings:mustAddCustomNodes'));
        }
        this.setState({ autoNodeList: !this.state.autoNodeList });
    }

    toggleAutomaticNodeSelection() {
        if (!this.state.autoNodeSelection) {
            this.setState(defaultState);
        }
        this.setState({ autoNodeSelection: !this.state.autoNodeSelection });
    }

    /**
     * Render setting rows
     *
     * @method renderSettingsContent
     * @returns {function}
     */
    renderSettingsContent() {
        const { theme, t, nodes } = this.props;
        const { autoNodeSelection, autoNodeList, autoSwitching, quorum, quorumSize, node } = this.state;
        const rows = [
            {
                name: t('nodeSettings:automaticNodeSelection'),
                function: () => this.toggleAutomaticNodeSelection(),
                toggle: autoNodeSelection
            },
            {
                name: t('nodeSettings:addCustomNodes'),
                function: () => this.props.setSetting('addCustomNode'),
            },
            { name: 'separator' },
            {
                name: t('nodeSettings:autoNodeList'),
                function: () => { !autoNodeSelection && this.toggleAutoNodeList(); },
                toggle: autoNodeList,
                inactive: autoNodeSelection
            },
            { name: 'separator', inactive: autoNodeSelection },
            {
                name: t('nodeSettings:nodeAutoswitching'),
                function: () => { !autoNodeSelection && this.setState({ autoSwitching: !autoSwitching }); },
                toggle: autoSwitching,
                inactive: autoNodeSelection
            },
            {
                name: t('nodeSettings:primaryNode'),
                function: (node) => this.setState({ node }),
                inactive: autoNodeSelection || autoSwitching,
                currentSetting: node,
                dropdownOptions: nodes
            },
            { name: 'separator', inactive: autoNodeSelection },
            {
                name: t('nodeSettings:enableQuorum'),
                function: () => { !autoNodeSelection && this.setState({ quorum: !quorum }); },
                toggle: quorum,
                inactive: autoNodeSelection
            },
            {
                name: t('nodeSettings:quorumSize'),
                function: (quorumSize) => this.setState({ quorumSize }),
                inactive: autoNodeSelection || !quorum,
                dropdownOptions: this.getQuorumOptions(),
                currentSetting: !quorum && '0' || quorumSize
            },
            {
                name: 'dualFooter',
                backFunction: () => this.props.setSetting('advancedSettings'),
                hideActionButton: isEqual(defaultState, this.state),
                actionName: 'Apply',
                actionFunction: () => {},
            },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    node: state.settings.node,
    nodes: state.settings.nodes,
    customNodes: state.settings.customNodes
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withNamespaces(['advancedSettings', 'nodeSettings', 'settings', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(NodeSettings),
);
