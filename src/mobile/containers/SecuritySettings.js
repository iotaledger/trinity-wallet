import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';
import { renderSettingsRows } from '../components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

/** Security Setting component */
class SecuritySettings extends Component {
    static propTypes = {
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Determines if two factor authentication is enabled */
        is2FAEnabled: PropTypes.bool.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('SecuritySettings');
    }

    on2FASetupPress() {
        const { is2FAEnabled, theme: { body } } = this.props;

        if (!is2FAEnabled) {
            this.props.navigator.push({
                screen: 'twoFactorSetupAddKey',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                animated: false,
            });
        } else {
            this.props.navigator.push({
                screen: 'disable2FA',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                animated: false,
            });
        }
    }

    onFingerprintSetupPress() {
        const { theme: { body } } = this.props;
        this.props.navigator.push({
            screen: 'fingerprintSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    renderSettingsContent() {
        const { theme, t } = this.props;
        const rows = [
            { name: t('changePassword'), icon: 'password', function: () => this.props.setSetting('changePassword') },
            { name: 'separator' },
            { name: t('twoFA'), icon: 'twoFA', function: () => this.on2FASetupPress() },
            { name: t('fingerprint'), icon: 'biometric', function: () => this.onFingerprintSetupPress() },
            { name: 'back', function: () => this.props.setSetting('mainSettings') },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    is2FAEnabled: state.settings.is2FAEnabled,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SecuritySettings));
