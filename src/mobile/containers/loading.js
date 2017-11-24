import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Dimensions,
    ImageBackground,
    WebView,
    StatusBar,
    Text,
    ActivityIndicator,
} from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from '../../shared/actions/marketData';
import { setBalance, setFirstUse } from '../../shared/actions/account';
import { changeHomeScreenRoute } from '../../shared/actions/home';
import Home from './home';
import IotaSpin from '../components/iotaSpin';

const width = Dimensions.get('window').width;
const height = global.height;
const logoSpin = require('../logo-spin/logo-spin-glow.html');

class Loading extends Component {
    componentDidMount() {
        this.props.changeHomeScreenRoute('balance');
    }

    render() {
        const { tempAccount: { ready }, account: { firstUse }, navigator, t } = this.props;

        if (!ready && this.props.account.firstUse) {
            return (
                <ImageBackground source={require('../../shared/images/bg-blue.png')} style={styles.container}>
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
                </ImageBackground>
            );
        } else if (!ready && !this.props.account.firstUse) {
            return (
                <ImageBackground source={require('../../shared/images/bg-blue.png')} style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <IotaSpin duration={3000} />
                </ImageBackground>
            );
        } else {
            return <Home navigator={navigator} />;
        }
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
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    setBalance: addressesWithBalance => {
        dispatch(setBalance(addressesWithBalance));
    },
    setFirstUse: boolean => {
        dispatch(setFirstUse(boolean));
    },
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
});

Loading.propTypes = {
    marketData: PropTypes.object.isRequired,
    tempAccount: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
};

export default translate('loading')(connect(mapStateToProps, mapDispatchToProps)(Loading));
