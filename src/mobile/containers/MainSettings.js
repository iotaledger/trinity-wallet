import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Navigation } from 'react-native-navigation';
import i18next from 'i18next';
import { toggleModalActivity } from 'iota-wallet-shared-modules/actions/ui';
import { selectLocale } from 'iota-wallet-shared-modules/libs/locale';
import { setSetting, clearWalletData, setPassword } from 'iota-wallet-shared-modules/actions/wallet';
import LogoutConfirmationModalComponent from '../components/LogoutConfirmationModal';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';
import { renderSettingsRows } from '../components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

/** Main Settings component */
export class MainSettings extends Component {
    static propTypes = {
        /** Currently selected application mode (Expert or Standard) */
        mode: PropTypes.string.isRequired,
        /** Currently selected currency */
        currency: PropTypes.string.isRequired,
        /** Currently selected theme name */
        themeName: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Clears wallet reducer data */
        clearWalletData: PropTypes.func.isRequired,
        /** Set new password hash
         * @param {string} passwordHash
         */
        setPassword: PropTypes.func.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalActive: false,
        };

        this.toggleModalDisplay = this.toggleModalDisplay.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('MainSettings');
    }

    toggleModalDisplay() {
        this.props.toggleModalActivity();
        this.setState({ isModalActive: !this.state.isModalActive });
    }

    logout() {
        const { theme: { body } } = this.props;

        this.props.clearWalletData();
        this.props.setPassword('');

        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                overrideBackPress: true,
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    renderModalContent() {
        const { theme: { body, bar } } = this.props;
        const textColor = { color: body.color };
        const bodyColor = body.color;

        return (
            <LogoutConfirmationModalComponent
                style={{ flex: 1 }}
                hideModal={this.toggleModalDisplay}
                logout={this.logout}
                backgroundColor={{ backgroundColor: body.bg }}
                textColor={textColor}
                borderColor={{ borderColor: bodyColor }}
                barBg={bar.bg}
            />
        );
    }

    renderSettingsContent() {
        const { theme, t, mode, themeName, currency } = this.props;
        const rows = [
            {
                name: t('mode'),
                icon: 'mode',
                function: () => this.props.setSetting('modeSelection'),
                currentSetting: mode,
            },
            {
                name: t('theme'),
                icon: 'theme',
                function: () => this.props.setSetting('themeCustomisation'),
                currentSetting: themeName,
            },
            {
                name: t('currency'),
                icon: 'currency',
                function: () => this.props.setSetting('currencySelection'),
                currentSetting: currency,
            },
            {
                name: t('language'),
                icon: 'language',
                function: () => this.props.setSetting('languageSelection'),
                currentSetting: selectLocale(i18next.language),
            },
            { name: 'separator' },
            { name: t('accountManagement'), icon: 'user', function: () => this.props.setSetting('accountManagement') },
            {
                name: t('securitySettings'),
                icon: 'security',
                function: () => this.props.setSetting('securitySettings'),
            },
            { name: t('advanced'), icon: 'advanced', function: () => this.props.setSetting('advancedSettings') },
            { name: 'separator' },
            { name: t('aboutTrinity'), icon: 'info', function: () => this.props.setSetting('about') },
            { name: t('logout'), icon: 'logout', function: () => this.props.setSetting(this.toggleModalDisplay) },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        const { theme } = this.props;

        return (
            <View style={styles.container}>
                {this.renderSettingsContent()}
                <Modal
                    animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                    animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                    animationInTiming={isAndroid ? 1000 : 300}
                    animationOutTiming={200}
                    backdropTransitionInTiming={isAndroid ? 500 : 300}
                    backdropTransitionOutTiming={200}
                    backdropColor={theme.body.bg}
                    backdropOpacity={0.9}
                    style={styles.modal}
                    isVisible={this.state.isModalActive}
                    onBackButtonPress={this.toggleModalDisplay}
                    useNativeDriver={isAndroid ? true : false}
                    hideModalContentWhileAnimating
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    mode: state.settings.mode,
    currency: state.settings.currency,
    themeName: state.settings.themeName,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
    clearWalletData,
    setPassword,
    toggleModalActivity,
};

export default translate(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(MainSettings));
