import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import i18next from 'shared-modules/libs/i18next';
import timer from 'react-native-timer';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { getLabelFromLocale } from 'shared-modules/libs/i18n';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { setSetting } from 'shared-modules/actions/wallet';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { renderSettingsRows } from 'ui/components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
});

/** Main Settings component */
export class MainSettings extends Component {
    static propTypes = {
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
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.openLogoutModal = this.openLogoutModal.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('MainSettings');
    }

    componentWillUnmount() {
        timer.clearTimeout('delayLogout');
    }

    /**
     * Opens or closes modal
     * @method openLogoutModal
     */
    openLogoutModal() {
        const { theme } = this.props;
        this.props.toggleModalActivity('logoutConfirmation', {
            style: { flex: 1 },
            hideModal: () => this.props.toggleModalActivity(),
            theme,
        });
    }

    renderSettingsContent() {
        const { theme, t, mode, themeName, currency } = this.props;
        const rows = [
            {
                name: t('mode'),
                icon: 'mode',
                function: () => this.props.setSetting('modeSelection'),
                currentSetting: mode === 'Advanced' ? t('modeSelection:advanced') : t('modeSelection:standard'),
            },
            {
                name: t('theme'),
                icon: 'theme',
                function: () => this.props.setSetting('themeCustomisation'),
                currentSetting: t(`themes:${themeName.toLowerCase()}`),
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
                currentSetting: getLabelFromLocale(i18next.language),
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
            { name: t('logout'), icon: 'logout', function: this.openLogoutModal },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    mode: state.settings.mode,
    currency: state.settings.currency,
    themeName: state.settings.themeName,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setSetting,
    toggleModalActivity,
};

export default withNamespaces(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(MainSettings));
