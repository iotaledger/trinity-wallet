import React from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient, Defs, Stop } from 'react-native-svg';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel, VictoryContainer } from 'victory-native';
import { width, height } from '../util/dimensions';

const chartWidth = width * 0.98;
const chartHeight = height * 0.46;
const victoryContainerWidth = width * 0.85;
const victoryContainerHeight = height * 0.46;

const getChartCurrencySymbol = currency => {
    if (currency === 'BTC') {
        return '₿';
    } else if (currency === 'ETH') {
        return 'Ξ';
    }

    return '$';
};

class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            price: this.props.marketData.usdPrice,
        };
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
        const { currencySymbol } = this.props;
        const { price } = this.state;
        const data = this.props.marketData.chartData[this.props.marketData.currency][this.props.marketData.timeframe];
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={styles.buttonContainer}>
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
                        <Text style={styles.iotaPrice}>
                            {getChartCurrencySymbol(this.props.marketData.currency)}{' '}
                            {this.getPriceFormat(this.state.price)} / Mi
                        </Text>
                    </View>
                    <View style={styles.buttonContainer}>
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
                    <VictoryContainer height={victoryContainerHeight} width={victoryContainerWidth}>
                        <VictoryChart domainPadding={20} height={chartHeight} width={chartWidth}>
                            <Defs>
                                <LinearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                    <Stop stopColor="#FFA25B" stopOpacity="1" offset="100%" />
                                    <Stop stopColor="#FFFFFF" stopOpacity="0.25" offset="0%" />
                                </LinearGradient>
                            </Defs>
                            <VictoryLine
                                data={data}
                                style={{
                                    data: {
                                        stroke: 'url(#gradient)',
                                        strokeWidth: 1.2,
                                    },
                                }}
                                domain={{
                                    x: [-1, this.getMaxX() + 1],
                                    y: [this.getMinY(), this.getMaxY()],
                                }}
                                scale={{ x: 'time', y: 'linear' }}
                                animate={{
                                    duration: 1500,
                                    onLoad: { duration: 2000 },
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                tickFormat={x => this.getPriceFormat(x)}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    tickLabels: { fill: 'white', fontSize: width / 44, fontFamily: 'Lato-Regular' },
                                }}
                                gridComponent={<Line type={'grid'} style={{ stroke: 'white', strokeWidth: 0.1 }} />}
                                tickLabelComponent={<VictoryLabel x={width / 100} textAnchor="start" />}
                                tickValues={this.getTickValues()}
                                domain={{
                                    y: [this.getMinY(), this.getMaxY()],
                                }}
                            />
                        </VictoryChart>
                    </VictoryContainer>
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
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#f2f2f2',
        borderWidth: 0.6,
        borderRadius: 5,
        paddingHorizontal: 10,
        // paddingVertical: 2.5,
        paddingTop: 2.5,
        paddingBottom: 3.5,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        paddingVertical: height / 1000,
    },
    topContainer: {
        paddingTop: 15,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center',
        zIndex: 1,
    },
    priceContainer: {
        flex: 8,
        alignItems: 'center',
    },
    chartContainer: {
        flex: 5,
        width: width / 1.15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    marketDataContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'normal',
        fontFamily: 'Lato-Regular',
        fontSize: width / 35,
    },
    iotaPrice: {
        color: 'white',
        fontWeight: 'normal',
        fontFamily: 'Lato-Regular',
        fontSize: width / 24,
    },
    marketFigure: {
        color: 'white',
        fontWeight: 'normal',
        fontFamily: 'Lato-Regular',
        fontSize: width / 37.6,
    },
});

module.exports = Chart;
