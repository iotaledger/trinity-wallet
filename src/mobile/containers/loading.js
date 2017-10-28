import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Dimensions, ImageBackground, WebView, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice, loginError } from '../../shared/actions/marketDataActions';
import Home from './home';
import Login from './login';

const { height, width } = Dimensions.get('window');
const logoSpin = require('../logo-spin/logo-spin-glow.html');

class Loading extends Component {
    componentDidMount() {
        this.getWalletData();
    }

    async getWalletData() {
        await this.props.getPrice('USD');
        await this.props.getMarketData();
        await this.props.getChartData('USD', '24h');
    }

    render() {
        const { iota: { ready, errorMessage }, navigator } = this.props;

        if (!ready) {
            return (
                <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <View style={{ height: width / 1.75, paddingLeft: 5 }}>
                        <WebView
                            scrollEnabled={false}
                            source={logoSpin}
                            style={{ backgroundColor: 'transparent', width: width / 1.75 }}
                        />
                    </View>
                </ImageBackground>
            );
        }
        if (errorMessage != '') {
            return <Login navigator={navigator} />;
        }

        return <Home navigator={navigator} />;
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
    iota: state.iota,
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
});

Loading.propTypes = {
    marketData: PropTypes.object.isRequired,
    iota: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired,
    getMarketData: PropTypes.func.isRequired,
    getPrice: PropTypes.func.isRequired,
    getChartData: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Loading);
