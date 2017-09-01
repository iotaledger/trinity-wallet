import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Svg, LinearGradient, Defs, Stop } from 'react-native-svg';
import {
  VictoryLine,
  VictoryAxis,
  Line,
  VictoryLabel,
} from 'victory-native';

const { height, width } = Dimensions.get('window');


const viewbox =  `0 0 ${width / 1.035} ${width / 1.29375}`

class Chart extends React.Component {

  constructor() {
    super();
    this.state = {
      data: [],
      iotaMCAP: '',
      iotaPrice: '',
      iotaVolume: '',
      currency: 'USD',
      timeFrame: '24h',
    };
  }

  onCurrencyClick() {
    switch (this.props.marketData.currency) {
      case 'USD':
        this.props.changeCurrency('BTC', this.props.marketData.timeFrame);
        break;
      case 'BTC':
        this.props.changeCurrency('ETH', this.props.marketData.timeFrame);
        break;
      case 'ETH':
        this.props.changeCurrency('USD', this.props.marketData.timeFrame);
        break;
    }
  }

  onTimeFrameClick() {
    switch (this.props.marketData.timeFrame) {
      case '24h':
        this.props.changeTimeFrame(this.props.marketData.currency, '7d');
        break;
      case '7d':
        this.props.changeTimeFrame(this.props.marketData.currency, '1m');
        break;
      case '1m':
        this.props.changeTimeFrame(this.props.marketData.currency, '1h');
        break;
      case '1h':
        this.props.changeTimeFrame(this.props.marketData.currency, '6h');
        break;
      case '6h':
        this.props.changeTimeFrame(this.props.marketData.currency, '24h');
        break;
    }
  }

  getMaxY() {
    const maxValue = Math.max(...this.props.marketData.chartData.map(function (object) { return object.y; }));
    return maxValue;
  }

  getMinY() {
    const minValue = Math.min(...this.props.marketData.chartData.map(function (object) { return object.y; }));
    return minValue;
  }

  getMaxX() {
    const maxValue = Math.max(...this.props.marketData.chartData.map(function (object) { return object.x; }));
    return maxValue;
  }

  getTickValues() {
    const minValue = this.getMinY();
    const maxValue = this.getMaxY();
    return ([
      minValue,
      (minValue + ((minValue + maxValue) / 2)) / 2,
      (minValue + maxValue) / 2,
      (maxValue + ((minValue + maxValue) / 2)) / 2,
      maxValue,
    ]);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
        <View style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={event => this.onCurrencyClick()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>{this.props.marketData.currency}</Text>
            </View>
        </TouchableWithoutFeedback>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.iotaPrice}>{this.props.marketData.price} / Mi</Text>
        </View>
        <View style={{flex: 1}}>
          <TouchableWithoutFeedback onPress={event => this.onTimeFrameClick()}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>{this.props.marketData.timeFrame}</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        </View>
        <View style={styles.chartContainer}>
          <Svg height={height / 2.65} width={width} viewBox={viewbox}>

            <Defs>
              <LinearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                <Stop stopColor="#FFA25B" stopOpacity="1" offset="100%" />
                <Stop stopColor="#FFFFFF" stopOpacity="0.25" offset="0%" />
              </LinearGradient>
            </Defs>

            <VictoryAxis
              dependentAxis
              standalone={false}
              style={{
                axis: { stroke: 'transparent' },
                tickLabels: { fill: 'white', fontSize: width / 40, fontFamily: 'Lato-Regular' },
              }}
              height={height / 2.65}
              gridComponent={<Line type={'grid'} style={{ stroke: 'white', strokeWidth: 0.25 }} />}
              tickLabelComponent={<VictoryLabel x={-width / 50} textAnchor="start" />}
              tickValues={this.getTickValues()}
              domain={{
                y: [this.getMinY(), this.getMaxY()],
              }}
            />
            <VictoryLine
              data={this.props.marketData.chartData}
              style={{
                data: {
                  stroke: 'url(#gradient)',
                  strokeWidth: 2,
                },
              }}
              domain={{
                x: [-1, this.getMaxX() + 1],
                y: [this.getMinY(), this.getMaxY()],
              }}
              scale={{ x: 'time', y: 'linear' }}
              height={height / 2.65}
              standalone={false}
              animate={{
                duration: 1500,
                onLoad: { duration: 2000 },
              }}
            />
          </Svg>
        </View>
        <View style={styles.marketDataContainer}>
          <Text style={styles.marketFigure}>MCAP: $ {this.props.marketData.mcap}</Text>
          <Text style={styles.marketFigure}>Change: {this.props.marketData.change24h}%</Text>
          <Text style={styles.marketFigure}>Volume (24h): $ {this.props.marketData.volume}</Text>
        </View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: height / 40,
    paddingTop: height / 80
  },
  topContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
    paddingBottom: height / 25,
    paddingHorizontal: width / 7.5,
  },
  priceContainer: {
    flex: 8,
    alignItems: 'center'
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
    paddingLeft: width / 11
  },
  marketDataContainer: {
    flex: 0.6,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width / 7.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular',
    fontSize: width / 30,
  },
  iotaPrice: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular',
    fontSize: width / 24,
  },
  marketFigure: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular',
    fontSize: width / 40.5,
  },

});

module.exports = Chart;
