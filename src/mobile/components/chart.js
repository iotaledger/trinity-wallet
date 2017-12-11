import React from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import { Svg, LinearGradient, Defs, Stop } from 'react-native-svg';
import { VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory-native';
import { width, height } from '../util/dimensions';
const timer = require('react-native-timer');

const viewbox = `${width / 3.95} ${height / 50} ${width / 3.93} ${height / 3.7}`;

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            price: this.props.marketData.usdPrice,
        };
    }

    componentWillMount() {
        switch (this.props.marketData.currency) {
            case 'USD':
                this.setState({ price: this.props.marketData.usdPrice });
                break;
            case 'BTC':
                this.setState({ price: this.props.marketData.btcPrice });
                break;
            case 'ETH':
                this.setState({ price: this.props.marketData.ethPrice });
                break;
        }
    }

    changeCurrency() {
        switch (this.props.marketData.currency) {
            case 'USD':
                this.props.setCurrency('BTC');
                this.setState({ price: this.props.marketData.btcPrice });
                break;
            case 'BTC':
                this.props.setCurrency('ETH');
                this.setState({ price: this.props.marketData.ethPrice });
                break;
            case 'ETH':
                this.props.setCurrency('USD');
                this.setState({ price: this.props.marketData.usdPrice });
                break;
        }
    }

    changeTimeframe() {
        switch (this.props.marketData.timeframe) {
            case '24h':
                this.props.setTimeframe('7d');
                break;
            case '7d':
                this.props.setTimeframe('1m');
                break;
            case '1m':
                this.props.setTimeframe('1h');
                break;
            case '1h':
                this.props.setTimeframe('24h');
                break;
        }
    }

    getMaxY() {
        const data = this.props.marketData.chartData[this.props.marketData.currency][this.props.marketData.timeframe];
        const maxValue = Math.max(
            ...data.map(object => {
                return object.y;
            }),
        );
        return maxValue;
    }

    getMinY() {
        const data = this.props.marketData.chartData[this.props.marketData.currency][this.props.marketData.timeframe];
        const minValue = Math.min(
            ...data.map(object => {
                return object.y;
            }),
        );
        return minValue;
    }

    getMaxX() {
        const data = this.props.marketData.chartData[this.props.marketData.currency][this.props.marketData.timeframe];
        const maxValue = Math.max(
            ...data.map(object => {
                return object.x;
            }),
        );
        return maxValue;
    }

    getTickValues() {
        const minValue = this.getMinY();
        const maxValue = this.getMaxY();
        return [
            minValue,
            (minValue + (minValue + maxValue) / 2) / 2,
            (minValue + maxValue) / 2,
            (maxValue + (minValue + maxValue) / 2) / 2,
            maxValue,
        ];
    }

    getPriceFormat(x) {
        if (this.props.marketData.currency == 'USD') {
            x = x.toFixed(3);
            return x;
        } else if (this.props.marketData.currency == 'BTC') {
            x = x.toFixed(6);
            return x;
        } else {
            x = x.toFixed(5);
            return x;
        }
    }

    render() {
        const { price } = this.state;
        const data = this.props.marketData.chartData[this.props.marketData.currency][this.props.marketData.timeframe];
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={event => this.changeCurrency()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            style={{ alignItems: 'flex-start' }}
                        >
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>{this.props.marketData.currency}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.iotaPrice}>{this.getPriceFormat(this.state.price)} / Mi</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={event => this.changeTimeframe()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            style={{ alignItems: 'flex-start' }}
                        >
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>{this.props.marketData.timeframe}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={styles.chartContainer}>
                    <Svg height={height / 3.2} width={width / 1.15} viewBox={viewbox}>
                        <Defs>
                            <LinearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                <Stop stopColor="#FFA25B" stopOpacity="1" offset="100%" />
                                <Stop stopColor="#FFFFFF" stopOpacity="0.25" offset="0%" />
                            </LinearGradient>
                        </Defs>

                        <VictoryAxis
                            dependentAxis
                            tickFormat={x => this.getPriceFormat(x)}
                            standalone={false}
                            style={{
                                axis: { stroke: 'transparent' },
                                tickLabels: { fill: 'white', fontSize: width / 44, fontFamily: 'Lato-Regular' },
                            }}
                            height={height / 3.2}
                            width={width / 1.15}
                            gridComponent={<Line type={'grid'} style={{ stroke: 'white', strokeWidth: 0.25 }} />}
                            tickLabelComponent={<VictoryLabel x={width / 100} textAnchor="start" />}
                            tickValues={this.getTickValues()}
                            domain={{
                                y: [this.getMinY(), this.getMaxY()],
                            }}
                        />
                        <VictoryLine
                            data={data}
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
                            height={height / 3.2}
                            width={width / 1.15}
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
        paddingTop: height / 80,
    },
    topContainer: {
        flex: 0.7,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1,
    },
    priceContainer: {
        flex: 8,
        alignItems: 'center',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        flex: 3.3,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    marketDataContainer: {
        flex: 0.6,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
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
        fontSize: width / 37.6,
    },
});

module.exports = Chart;
