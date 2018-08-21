import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { translate } from 'react-i18next';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';
import { renderSettingsRows } from '../components/SettingsContent';

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
        seedCount: PropTypes.number.isRequired,
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
        const { seedCount, t } = this.props;

        if (seedCount === 1) {
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
            { name: t('viewSeed'), icon: 'eye', function: () => this.props.setSetting('viewSeed') },
            { name: t('viewAddresses'), icon: 'addresses', function: () => this.props.setSetting('viewAddresses') },
            { name: t('editAccountName'), icon: 'edit', function: () => this.props.setSetting('editAccountName') },
            { name: t('deleteAccount'), icon: 'trash', function: () => this.deleteAccount() },
            { name: 'separator' },
            { name: t('addNewAccount'), icon: 'plus', function: () => this.props.setSetting('addNewAccount') },
            { name: 'back', function: () => this.props.setSetting('mainSettings') },
        ];

        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    seedCount: state.accounts.seedCount,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
    setSetting,
};

export default translate(['accountManagement', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AccountManagement),
);
