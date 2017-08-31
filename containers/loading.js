import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ImageBackground,
  WebView,
} from 'react-native';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from '../actions/marketDataActions';
import Home from './home';

const { height, width } = Dimensions.get('window');
const logoSpin = require('../logo-spin/logo-spin-glow.html');

class Loading extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getWalletData();
  }

  async getWalletData() {
    await this.props.getPrice('USD');
    await this.props.getMarketData();
    await this.props.getChartData('USD', '24h');
  }

  render() {
    if (!this.props.iota.ready) {
      return (
        <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
          <View style={{ height: width / 1.75, paddingLeft: 5 }}>
            <WebView
              source={logoSpin}
              style={{ backgroundColor: 'transparent', width: width / 1.75 }}
            />
          </View>
        </ImageBackground>
      );
    }
    return (
      <Home />
    );
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
  getPrice: (currency) => {
    dispatch(getPrice(currency));
  },
  getChartData: (currency, timeFrame) => {
    dispatch(getChartData(currency, timeFrame));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Loading);
