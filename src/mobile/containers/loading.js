import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar, Text, ActivityIndicator } from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getAccountInfo, getFullAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import keychain, { getSeed } from '../util/keychain';
import { Navigation } from 'react-native-navigation';
import IotaSpin from '../components/iotaSpin';
import THEMES from '../theme/themes';
import KeepAwake from 'react-native-keep-awake';

import { width, height } from '../util/dimensions';
const logoSpin = require('../logo-spin/logo-spin-glow.html');

class Loading extends Component {
    componentDidMount() {
        KeepAwake.activate();
        this.props.changeHomeScreenRoute('balance');
        this.props.setSetting('mainSettings');

        const { firstUse, selectedAccountName } = this.props;

        keychain
            .get()
            .then(credentials => {
                const seed = getSeed(credentials.data, 0);

                if (firstUse) {
                    this.props.getFullAccountInfo(seed, selectedAccountName, this.props.navigator);
                } else {
                    this.props.getAccountInfo(seed, selectedAccountName, this.props.navigator);
                }
            })
            .catch(err => console.log(err)); // Dropdown
    }

    componentWillReceiveProps(newProps) {
        const ready = !this.props.tempAccount.ready && newProps.tempAccount.ready;

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
            });
        }
    }

    render() {
        const { firstUse, t, negativeColor, backgroundColor } = this.props;

        if (firstUse) {
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
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    setSetting,
    getAccountInfo,
    getFullAccountInfo,
};

Loading.propTypes = {
    firstUse: PropTypes.bool.isRequired,
    tempAccount: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    getAccountInfo: PropTypes.func.isRequired,
    getFullAccountInfo: PropTypes.func.isRequired,
    selectedAccountName: PropTypes.string.isRequired,
    backgroundColor: PropTypes.object.isRequired,
    negativeColor: PropTypes.object.isRequired,
};

export default translate('loading')(connect(mapStateToProps, mapDispatchToProps)(Loading));
