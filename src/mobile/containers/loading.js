import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar, Text, ActivityIndicator } from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import {
    getAccountInfo,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
} from 'iota-wallet-shared-modules/actions/account';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import keychain, { getSeed, storeSeedInKeychain } from '../util/keychain';
import { Navigation } from 'react-native-navigation';
import IotaSpin from '../components/iotaSpin';
import THEMES from '../theme/themes';
import KeepAwake from 'react-native-keep-awake';

import { width, height } from '../util/dimensions';

class Loading extends Component {
    componentDidMount() {
        KeepAwake.activate();

        this.props.changeHomeScreenRoute('balance');
        this.props.setSetting('mainSettings');

        const {
            firstUse,
            addingAdditionalAccount,
            additionalAccountName,
            selectedAccountName,
            seed,
            password,
            navigator,
        } = this.props;

        keychain
            .get()
            .then(credentials => {
                const firstSeed = getSeed(credentials.data, 0);

                if (firstUse && !addingAdditionalAccount) {
                    this.props.getFullAccountInfo(firstSeed, selectedAccountName, navigator);
                } else if (!firstUse && addingAdditionalAccount) {
                    this.props.fetchFullAccountInfoForFirstUse(
                        seed,
                        additionalAccountName,
                        password,
                        storeSeedInKeychain,
                        navigator,
                    );
                } else {
                    this.props.getAccountInfo(firstSeed, selectedAccountName, navigator);
                }
            })
            .catch(err => console.log(err)); // Dropdown
    }

    componentWillReceiveProps(newProps) {
        const ready = !this.props.ready && newProps.ready;

        if (ready) {
            KeepAwake.deactivate();
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'home',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                },
            });
        }
    }

    render() {
        const { firstUse, t, addingAdditionalAccount, negativeColor, backgroundColor } = this.props;

        if (firstUse || addingAdditionalAccount) {
            return (
                <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                    <StatusBar barStyle="light-content" />
                    <View style={{ flex: 1 }} />
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.infoText}>{t('loadingFirstTime')}</Text>
                        <Text style={styles.infoText}>{t('thisMayTake')}</Text>
                        <Text style={styles.infoText}>{t('youMayNotice')}</Text>
                        <ActivityIndicator
                            animating={true}
                            style={styles.activityIndicator}
                            size="large"
                            color={THEMES.getHSL(negativeColor)}
                        />
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <IotaSpin duration={3000} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 40,
    },
});

const mapStateToProps = state => ({
    firstUse: state.account.firstUse,
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    addingAdditionalAccount: state.tempAccount.addingAdditionalAccount,
    additionalAccountName: state.tempAccount.additionalAccountName,
    seed: state.tempAccount.seed,
    ready: state.tempAccount.ready,
    password: state.tempAccount.password,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    setSetting,
    getAccountInfo,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
};

Loading.propTypes = {
    firstUse: PropTypes.bool.isRequired,
    navigator: PropTypes.object.isRequired,
    getAccountInfo: PropTypes.func.isRequired,
    getFullAccountInfo: PropTypes.func.isRequired,
    fetchFullAccountInfoForFirstUse: PropTypes.func.isRequired,
    selectedAccountName: PropTypes.string.isRequired,
    backgroundColor: PropTypes.object.isRequired,
    negativeColor: PropTypes.object.isRequired,
};

export default translate('loading')(connect(mapStateToProps, mapDispatchToProps)(Loading));
