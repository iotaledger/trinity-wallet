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
        /** @ignore */
        isSendingTransfer: PropTypes.bool.isRequired,
    };

    constructor() {
        super();
        this.onNodeSelection = this.onNodeSelection.bind(this);
        this.onAddCustomNode = this.onAddCustomNode.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NodeSettings');
    }

    /**
     * Navigates to node selection setting screen
     *
     * @method onNodeSelection
     */
    onNodeSelection() {
        if (this.props.isSendingTransfer) {
            this.generateChangeNodeAlert();
        } else {
            this.props.setSetting('nodeSelection');
        }
    }

    /**
     * Navigates to add custom node setting screen
     *
     * @method onAddCustomNode
     */
    onAddCustomNode() {
        if (this.props.isSendingTransfer) {
            this.generateChangeNodeAlert();
        } else {
            this.props.setSetting('addCustomNode');
        }
    }

    /**
     * Generates an alert if a user tries to navigate to change node or add custom node screen when a transaction is in progress
     *
     * @method generateChangeNodeAlert
     */
    generateChangeNodeAlert() {
        this.props.generateAlert(
            'error',
            this.props.t('settings:cannotChangeNode'),
            `${this.props.t('settings:cannotChangeNodeWhileSending')} ${this.props.t(
                'settings:transferSendingExplanation',
            )}`,
        );
    }

    /**
     * Render setting rows
     *
     * @method renderSettingsContent
     * @returns {function}
     */
    renderSettingsContent() {
        const { theme, t, node } = this.props;
        const rows = [
            { name: t('selectNode'), icon: 'node', function: this.onNodeSelection, currentSetting: node },
            { name: t('addCustomNode'), icon: 'plusAlt', function: this.onAddCustomNode },
            { name: 'back', function: () => this.props.setSetting('advancedSettings') },
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
    isSendingTransfer: state.ui.isSendingTransfer,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withNamespaces(['advancedSettings', 'settings', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(NodeSettings),
);
