import noop from 'lodash/noop';
import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient, Defs, Stop } from 'react-native-svg';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory-native';
import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';
import GENERAL from '../theme/general';

const chartWidth = width * 0.98;
const chartHeight = height * 0.38;

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: height / 2000,
        borderRadius: GENERAL.borderRadiusSmall,
        paddingHorizontal: width / 40,
        paddingVertical: height / 110,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    topContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center',
        zIndex: 1,
        paddingVertical: height / 70,
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
        paddingLeft: width / 8,
    },
    marketDataContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'normal',
        fontFamily: 'Lato-Regular',
        fontSize: width / 35,
    },
    iotaPrice: {
        fontWeight: 'normal',
        fontFamily: 'Lato-Regular',
        fontSize: width / 24,
    },
    marketFigure: {
        fontWeight: 'normal',
        fontFamily: 'Lato-Regular',
        fontSize: width / 37.6,
    },
    marketFigureTitle: {
        fontWeight: 'bold',
    },
});

const getChartCurrencySymbol = currency => {
    if (currency === 'BTC') {
        return isAndroid ? '฿' : '₿';
    } else if (currency === 'ETH') {
        return 'Ξ';
    } else if (currency === 'EUR') {
        return '€';
    }

    return '$';
};

const timeframeFromCurrent = {
    '24h': '7d',
    '7d': '1m',
    '1m': '1h',
    '1h': '24h',
};

const nextCurrency = {
    USD: 'EUR',
    EUR: 'BTC',
    BTC: 'ETH',
    ETH: 'USD',
};

class Chart extends Component {
    static propTypes = {
        textColor: PropTypes.string.isRequired,
        marketData: PropTypes.object.isRequired,
        setCurrency: PropTypes.func.isRequired,
        setTimeframe: PropTypes.func.isRequired,
        borderColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        chartLineColorPrimary: PropTypes.string.isRequired,
        chartLineColorSecondary: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            price: props.marketData.usdPrice,
        };
    }

    componentWillMount() {
        const { marketData } = this.props;
        switch (marketData.currency) {
            case 'USD':
                return this.setState({ price: marketData.usdPrice });
            case 'EUR':
                return this.setState({ price: marketData.eurPrice });
            case 'BTC':
                return this.setState({ price: marketData.btcPrice });
            case 'ETH':
                return this.setState({ price: marketData.ethPrice });
            default:
                return noop;
        }
    }

    getMaxY() {
        const { marketData } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        const maxValue = Math.max(...data.map(object => object.y));
        return maxValue;
    }

    getMinY() {
        const { marketData } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        const minValue = Math.min(...data.map(object => object.y));
        return minValue;
    }

    getMaxX() {
        const { marketData } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        const maxValue = Math.max(...data.map(object => object.x));
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
        const { marketData } = this.props;
        const xValue = parseFloat(x);

        if (marketData.currency === 'USD') {
            return xValue.toFixed(2);
        } else if (marketData.currency === 'EUR') {
            return xValue.toFixed(2);
        }
        return xValue.toFixed(5);
    }

    changeCurrency() {
        const { marketData, setCurrency } = this.props;
        const newCurrency = nextCurrency[marketData.currency];
        setCurrency(newCurrency);
        this.setState({ price: marketData[`${newCurrency.toLowerCase()}Price`] });
    }

    changeTimeframe() {
        const { marketData, setTimeframe } = this.props;
        setTimeframe(timeframeFromCurrent[marketData.timeframe]);
    }

    render() {
        const { price } = this.state;
        const {
            marketData,
            textColor,
            borderColor,
            secondaryBackgroundColor,
            chartLineColorPrimary,
            chartLineColorSecondary,
        } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={[styles.buttonContainer, borderColor]}>
                        <TouchableWithoutFeedback
                            onPress={() => this.changeCurrency()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            style={{ alignItems: 'flex-start' }}
                        >
                            <View style={styles.button}>
                                <Text style={[styles.buttonText, textColor]}>{marketData.currency}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.iotaPrice, textColor]}>
                            {getChartCurrencySymbol(marketData.currency)} {this.getPriceFormat(price)} / Mi
                        </Text>
                    </View>
                    <View style={[styles.buttonContainer, borderColor]}>
                        <TouchableWithoutFeedback
                            onPress={() => this.changeTimeframe()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            style={{ alignItems: 'flex-start' }}
                        >
                            <View style={styles.button}>
                                <Text style={[styles.buttonText, textColor]}>{marketData.timeframe}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={styles.chartContainer}>
                    <VictoryChart domainPadding={isAndroid ? 0 : 15} height={chartHeight} width={chartWidth}>
                        <Defs>
                            <LinearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                <Stop stopColor={chartLineColorPrimary} stopOpacity="1" offset="100%" />
                                <Stop stopColor={chartLineColorSecondary} stopOpacity="1" offset="25%" />
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
                                x: [-(this.getMaxX() * 0.016), this.getMaxX() + this.getMaxX() * 0.016],
                                y: [this.getMinY(), this.getMaxY()],
                            }}
                            scale={{ x: 'time', y: 'linear' }}
                            animate={{
                                duration: 450,
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            tickFormat={x => this.getPriceFormat(x)}
                            style={{
                                axis: { stroke: 'transparent' },
                                tickLabels: {
                                    fill: secondaryBackgroundColor,
                                    fontSize: width / 44,
                                    fontFamily: 'Lato-Regular',
                                },
                            }}
                            gridComponent={
                                <Line type={'grid'} style={{ stroke: secondaryBackgroundColor, strokeWidth: 0.1 }} />
                            }
                            tickLabelComponent={<VictoryLabel x={width / 100} textAnchor="start" />}
                            tickValues={this.getTickValues()}
                            domain={{
                                y: [this.getMinY(), this.getMaxY()],
                            }}
                        />
                    </VictoryChart>
                </View>
                <View style={styles.marketDataContainer}>
                    <Text style={[styles.marketFigure, textColor]}>
                        <Text style={[styles.marketFigureTitle, textColor]}>MCAP</Text> $ {marketData.mcap}
                    </Text>
                    <Text style={[styles.marketFigure, textColor]}>
                        <Text style={styles.marketFigureTitle}>Change</Text> {marketData.change24h}%
                    </Text>
                    <Text style={[styles.marketFigure, textColor]}>
                        <Text style={styles.marketFigureTitle}>Volume (24h)</Text> $ {marketData.volume}
                    </Text>
                </View>
                <View style={{ flex: 0.2 }} />
            </View>
        );
    }
}

export default Chart;
