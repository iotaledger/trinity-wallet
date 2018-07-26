import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BackHandler, View, StyleSheet } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { translate } from 'react-i18next';
import timer from 'react-native-timer';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';
import { renderSettingsRows } from '../components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

/**
 * Add new account component
 */
class AddNewAccount extends Component {
    static propTypes = {
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.addNewSeed = this.addNewSeed.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('AddNewAccount');
    }

    addNewSeed() {
        const { theme } = this.props;
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'newSeedSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: theme.body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: theme.body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: false,
            },
        });
        timer.clearInterval('inactivityTimer');
        BackHandler.removeEventListener('homeBackPress');
    }

    renderSettingsContent() {
        const { theme, t } = this.props;
        const rows = [
            { name: t('useExistingSeed'), icon: 'key', function: () => this.props.setSetting('addExistingSeed') },
            { name: t('createNewSeed'), icon: 'plus', function: this.addNewSeed },
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
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['addNewAccount', 'global'])(connect(mapStateToProps, mapDispatchToProps)(AddNewAccount));
