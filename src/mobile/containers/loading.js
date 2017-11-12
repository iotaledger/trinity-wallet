import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Dimensions, ImageBackground, WebView, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from '../../shared/actions/marketData';
import { setBalance } from '../../shared/actions/account';
import { changeHomeScreenRoute } from '../../shared/actions/home';
import Home from './home';
import IotaSpin from '../components/iotaSpin';
import RNShakeEvent from 'react-native-shake-event'; // For HockeyApp bug reporting

const { height, width } = Dimensions.get('window');
const logoSpin = require('../logo-spin/logo-spin-glow.html');

class Loading extends Component {
    componentDidMount() {
        this.props.changeHomeScreenRoute('balance');
    }

    render() {
        const { tempAccount: { ready }, account: { firstUse }, navigator } = this.props;

        if (!ready && !firstUse) {
            return (
                <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <IotaSpin duration={3000} />
                </ImageBackground>
            );
        } else if (!ready && firstUse) {
            return (
                <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
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
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    getMarketData: () => {
        dispatch(getMarketData());
    },
    getPrice: currency => {
        dispatch(getPrice(currency));
    },
    getChartData: (currency, timeFrame) => {
        dispatch(getChartData(currency, timeFrame));
    },
    setBalance: addressesWithBalance => {
        dispatch(setBalance(addressesWithBalance));
    },
    changeHomeScreenRoute: route => dispatch(changeHomeScreenRoute(route)),
});

Loading.propTypes = {
    marketData: PropTypes.object.isRequired,
    tempAccount: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    getMarketData: PropTypes.func.isRequired,
    getPrice: PropTypes.func.isRequired,
    getChartData: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Loading);
