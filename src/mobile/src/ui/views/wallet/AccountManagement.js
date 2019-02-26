import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { withNamespaces } from 'react-i18next';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { renderSettingsRows } from 'ui/components/SettingsContent';
import { isIPhone11 } from 'libs/device';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

/**
 * Account Management component
 */
class AccountManagement extends Component {
    static propTypes = {
        /** @ignore */
        accountCount: PropTypes.number.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('AccountManagement');
    }

    /**
     * Navigate to delete account setting screen
     *
     * @method deleteAccount
     */
    deleteAccount() {
        const { accountCount, t } = this.props;

        if (accountCount === 1) {
            return this.props.generateAlert(
                'error',
                t('global:cannotPerformAction'),
                t('global:cannotPerformActionExplanation'),
            );
        }

        return this.props.setSetting('deleteAccount');
    }

    /**
     * Renders setting screen rows
     *
     * @method renderSettingsContent
     *
     * @returns {function}
     */
    renderSettingsContent() {
        const { theme, t } = this.props;
        const rows = [
            { name: t('viewAddresses'), icon: 'addresses', function: () => this.props.setSetting('viewAddresses') },
            { name: t('editAccountName'), icon: 'edit', function: () => this.props.setSetting('editAccountName') },
            { name: t('deleteAccount'), icon: 'trash', function: () => this.deleteAccount() },
            { name: t('addNewAccount'), icon: 'plusAlt', function: () => this.props.setSetting('addNewAccount') },
            { name: 'separator' },
            { name: t('viewSeed'), icon: 'eye', function: () => this.props.setSetting('viewSeed') },
            {
                name: t('seedVault:exportSeedVault'),
                icon: 'key',
                function: () => this.props.setSetting('exportSeedVault'),
            },
            { name: 'back', function: () => this.props.setSetting('mainSettings') },
        ];

        if (isIPhone11) {
            rows.splice(6, 1);
        }
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    accountCount: Object.keys(state.accounts.accountInfo).length,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    generateAlert,
    setSetting,
};

export default withNamespaces(['accountManagement', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AccountManagement),
);
