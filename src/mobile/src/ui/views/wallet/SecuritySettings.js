import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { renderSettingsRows } from 'ui/components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

/** Security Setting component */
class SecuritySettings extends Component {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        is2FAEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('SecuritySettings');
    }

    /**
     * Navigates to two factor authentication screen
     * @method on2FASetupPress
     */
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

    /**
     * Navigates to fingerprint setup screen
     * @method onFingerprintSetupPress
     */
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
        const { theme, t, is2FAEnabled, isFingerprintEnabled } = this.props;
        const rows = [
            { name: t('changePassword'), icon: 'password', function: () => this.props.setSetting('changePassword') },
            { name: 'separator' },
            {
                name: t('twoFA'),
                icon: 'twoFA',
                function: () => this.on2FASetupPress(),
                currentSetting: is2FAEnabled ? t('enabled') : t('disabled'),
            },
            {
                name: t('fingerprint'),
                icon: 'biometric',
                function: () => this.onFingerprintSetupPress(),
                currentSetting: isFingerprintEnabled ? t('enabled') : t('disabled'),
            },
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
    is2FAEnabled: state.settings.is2FAEnabled,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SecuritySettings));
