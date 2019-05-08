import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { navigator } from 'libs/navigation';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
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
        isFingerprintEnabled: PropTypes.bool.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('SecuritySettings');
    }

    /**
     * Navigates to BiometricAuthentication screen
     * @method onBiometricAuthenticationPress
     */
    onBiometricAuthenticationPress() {
        navigator.push('biometricAuthentication');
    }

    renderSettingsContent() {
        const { theme, t, isFingerprintEnabled } = this.props;
        const rows = [
            { name: t('changePassword'), icon: 'password', function: () => this.props.setSetting('changePassword') },
            { name: 'separator' },
            {
                name: t('fingerprint'),
                icon: 'biometric',
                function: () => this.onBiometricAuthenticationPress(),
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
    theme: getThemeFromState(state),
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    setSetting,
};

export default withNamespaces(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SecuritySettings));
