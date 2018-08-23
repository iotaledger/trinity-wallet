import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import i18next from 'i18next';
import { toggleModalActivity } from 'shared/actions/ui';
import { selectLocale } from 'shared/libs/locale';
import { setSetting, clearWalletData, setPassword } from 'shared/actions/wallet';
import LogoutConfirmationModalComponent from 'mobile/src/ui/components/LogoutConfirmationModal';
import { width, height } from 'mobile/src/libs/dimensions';
import { isAndroid } from 'mobile/src/libs/device';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';
import { renderSettingsRows } from 'mobile/src/ui/components/SettingsContent';

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
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Currently selected application mode (Expert or Standard) */
        mode: PropTypes.string.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        isModalActive: PropTypes.bool.isRequired,
    };

    constructor() {
        super();
        this.toggleModalDisplay = this.toggleModalDisplay.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('MainSettings');
    }

    /**
     * Opens or closes modal
     * @method toggleModalDisplay
     */
    toggleModalDisplay() {
        this.props.toggleModalActivity();
    }

    /**
     * Clears temporary wallet data and navigates to login screen
     * @method logout
     */
    logout() {
        const { theme: { body } } = this.props;
        this.props.toggleModalActivity();
        this.props.clearWalletData();
        this.props.setPassword({});
        this.props.navigator.resetTo({
            screen: 'login',
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
            { name: t('logout'), icon: 'logout', function: this.toggleModalDisplay },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        const { theme, isModalActive } = this.props;

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
                    isVisible={isModalActive}
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
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = {
    setSetting,
    clearWalletData,
    setPassword,
    toggleModalActivity,
};

export default translate(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(MainSettings));
