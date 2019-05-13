import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { generateAlert } from 'shared-modules/actions/alerts';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { renderSettingsRows } from 'ui/components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

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
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        node: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            autoNodeSelection: true,
            autoNodeList: true,
            autoSwitching: true,
            quorum: true
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NodeSettings');
    }

    toggleAutomaticNodeSelection() {
        if (!this.state.autoNodeSelection) {
            this.setState({ autoNodeList: true, autoSwitching: true, quorum: true });
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
        const { theme, t } = this.props;
        const { autoNodeSelection, autoNodeList, autoSwitching, quorum } = this.state;
        const rows = [
            {
                name: 'Automatic node selection',
                function: () => this.toggleAutomaticNodeSelection(),
                toggle: autoNodeSelection
            },
            { name: 'separator' },
            {
                name: 'Add custom nodes',
                function: () => {},
            },
            {
                name: 'Use automatic node list',
                function: () => { !autoNodeSelection && this.setState({ autoNodeList: !autoNodeList }); },
                toggle: autoNodeList,
                inactive: autoNodeSelection
            },
            { name: 'separator', inactive: autoNodeSelection },
            {
                name: 'Node autoswitching',
                function: () => { !autoNodeSelection && this.setState({ autoSwitching: !autoSwitching }); },
                toggle: autoSwitching,
                inactive: autoNodeSelection
            },
            {
                name: 'Primary node address',
                function: () => {},
                inactive: autoNodeSelection
            },
            { name: 'separator', inactive: autoNodeSelection },
            {
                name: 'Quorum active',
                function: () => { !autoNodeSelection && this.setState({ quorum: !quorum }); },
                toggle: quorum,
                inactive: autoNodeSelection
            },
            {
                name: 'Quorum size',
                function: () => {},
                inactive: autoNodeSelection
            },
            {
                name: 'dualFooter',
                backFunction: () => this.props.setSetting('advancedSettings'),
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
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withNamespaces(['advancedSettings', 'settings', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(NodeSettings),
);
