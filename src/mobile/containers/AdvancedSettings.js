import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';
import { renderSettingsRows } from '../components/SettingsContent';

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
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Currently selected IRI node */
        node: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Determines if wallet is making a transaction */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        autoPromotion: PropTypes.bool.isRequired,
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

    onNodeSelection() {
        if (this.props.isSendingTransfer) {
            this.generateChangeNodeAlert();
        } else {
            this.props.setSetting('nodeSelection');
        }
    }

    onAddCustomNode() {
        if (this.props.isSendingTransfer) {
            this.generateChangeNodeAlert();
        } else {
            this.props.setSetting('addCustomNode');
        }
    }

    generateChangeNodeAlert() {
        this.props.generateAlert(
            'error',
            this.props.t('settings:cannotChangeNode'),
            `${this.props.t('settings:cannotChangeNodeWhileSending')} ${this.props.t(
                'settings:transferSendingExplanation',
            )}`,
        );
    }

    reset() {
        const { theme } = this.props;
        this.props.navigator.push({
            screen: 'walletResetConfirm',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
            },
            animated: false,
        });
    }

    renderSettingsContent() {
        const { theme, t, node, autoPromotion, remotePoW } = this.props;
        const rows = [
            { name: t('selectNode'), icon: 'node', function: this.onNodeSelection, currentSetting: node },
            { name: t('addCustomNode'), icon: 'plus', function: this.onAddCustomNode },
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

export default translate(['advancedSettings', 'settings', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings),
);
