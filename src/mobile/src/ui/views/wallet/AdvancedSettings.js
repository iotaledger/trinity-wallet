import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { setSetting } from 'shared-modules/actions/wallet';
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
export class AdvancedSettings extends PureComponent {
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
        /** @ignore */
        autoPromotion: PropTypes.bool.isRequired,
        /** @ignore */
        remotePoW: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        this.reset = this.reset.bind(this);
        this.onNodeSelection = this.onNodeSelection.bind(this);
        this.onAddCustomNode = this.onAddCustomNode.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('AdvancedSettings');
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
     * Navigate to wallet reset confirmation screen
     *
     * @method reset
     */
    reset() {
        const { theme: { body } } = this.props;
        Navigation.push('appStack', {
            component: {
                name: 'walletResetConfirm',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Render setting rows
     *
     * @method renderSettingsContent
     * @returns {function}
     */
    renderSettingsContent() {
        const { theme, t, node, autoPromotion, remotePoW } = this.props;
        const rows = [
            { name: t('selectNode'), icon: 'node', function: this.onNodeSelection, currentSetting: node },
            { name: t('addCustomNode'), icon: 'plusAlt', function: this.onAddCustomNode },
            {
                name: t('pow'),
                icon: 'pow',
                function: () => this.props.setSetting('pow'),
                currentSetting: remotePoW ? t('pow:remote') : t('pow:local'),
            },
            {
                name: t('autoPromotion'),
                icon: 'sync',
                function: () => this.props.setSetting('autoPromotion'),
                currentSetting: autoPromotion ? t('enabled') : t('disabled'),
            },
            { name: 'separator' },
            {
                name: t('snapshotTransition'),
                icon: 'snapshot',
                function: () => this.props.setSetting('snapshotTransition'),
            },
            { name: t('manualSync'), icon: 'sync', function: () => this.props.setSetting('manualSync') },
            { name: 'separator' },
            { name: t('settings:reset'), icon: 'trash', function: this.reset },
            { name: 'back', function: () => this.props.setSetting('mainSettings') },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    node: state.settings.node,
    autoPromotion: state.settings.autoPromotion,
    remotePoW: state.settings.remotePoW,
    isSendingTransfer: state.ui.isSendingTransfer,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withNamespaces(['advancedSettings', 'settings', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings),
);
