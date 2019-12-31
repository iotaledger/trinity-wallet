import isEmpty from 'lodash/isEmpty';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import navigator from 'libs/navigation';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getSpentAddressDataWithBalanceForSelectedAccount } from 'shared-modules/selectors/accounts';
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
        theme: PropTypes.object.isRequired,
        /** @ignore */
        autoPromotion: PropTypes.bool.isRequired,
        /** @ignore */
        deepLinking: PropTypes.bool.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Spent address data with balance for selected account */
        spentAddressDataWithBalance: PropTypes.array.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('AdvancedSettings');
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
        const { theme, t, autoPromotion, deepLinking, isSendingTransfer, spentAddressDataWithBalance } = this.props;
        const hasSpentAddressData = !isEmpty(spentAddressDataWithBalance);
        const rows = [
            {
                name: t('settings:nodeSettings'),
                icon: 'node',
                function: () => {
                    if (isSendingTransfer) {
                        return this.generateChangeNodeAlert();
                    }
                    return this.props.setSetting('nodeSettings');
                },
            },
            {
                name: t('autoPromotion'),
                icon: 'sync',
                function: () => this.props.setSetting('autoPromotion'),
                currentSetting: autoPromotion ? t('enabled') : t('disabled'),
            },
            {
                name: t('deepLinking'),
                icon: 'link',
                function: () => this.props.setSetting('deepLinking'),
                currentSetting: deepLinking ? t('enabled') : t('disabled'),
            },
            { name: 'separator' },
            {
                name: t('snapshotTransition'),
                icon: 'snapshot',
                function: () => this.props.setSetting('snapshotTransition'),
            },
            { name: t('manualSync'), icon: 'sync', function: () => this.props.setSetting('manualSync') },
            hasSpentAddressData && {
                name: t('sweeps:recoverLockedFunds'),
                icon: 'sweeps',
                function: () => navigator.push('sweepsAbout'),
            },
            {
                name: t('stateExport'),
                icon: 'copy',
                function: () => this.props.setSetting('stateExport'),
            },
            { name: 'separator' },
            { name: t('settings:reset'), icon: 'trash', function: () => navigator.push('walletResetConfirm') },
            { name: 'back', function: () => this.props.setSetting('mainSettings') },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    autoPromotion: state.settings.autoPromotion,
    deepLinking: state.settings.deepLinking,
    isSendingTransfer: state.ui.isSendingTransfer,
    isRecoveringFunds: state.ui.isRecoveringFunds,
    spentAddressDataWithBalance: getSpentAddressDataWithBalanceForSelectedAccount(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withTranslation(['advancedSettings', 'settings', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(AdvancedSettings),
);
