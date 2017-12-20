import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, WebView, StatusBar, Text, ActivityIndicator } from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { Navigation } from 'react-native-navigation';
import Home from './home';
import IotaSpin from '../components/iotaSpin';
import COLORS from '../theme/Colors';

import { width, height } from '../util/dimensions';
const logoSpin = require('../logo-spin/logo-spin-glow.html');

class Loading extends Component {
    componentDidMount() {
        this.props.changeHomeScreenRoute('balance');
        this.props.setSetting('mainSettings');
    }

    componentWillReceiveProps(newProps) {
        const ready = !this.props.tempAccount.ready && newProps.tempAccount.ready;
        if (ready) {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'home',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: COLORS.backgroundGreen,
                    },
                    overrideBackPress: true,
                },
            });
        }
    }

    render() {
        const { tempAccount: { ready }, account: { firstUse }, navigator, t } = this.props;

        if (this.props.account.firstUse) {
            return (
                <View style={styles.container}>
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
                            color="#F7D002"
                        />
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
            );
        } else if (!this.props.account.firstUse) {
            return (
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <IotaSpin duration={3000} />
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.backgroundGreen,
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
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
    setSetting: setting => dispatch(setSetting(setting)),
});

Loading.propTypes = {
    marketData: PropTypes.object.isRequired,
    tempAccount: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
};

export default translate('loading')(connect(mapStateToProps, mapDispatchToProps)(Loading));
