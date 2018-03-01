import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient, Defs, Stop } from 'react-native-svg';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory-native';
import { translate } from 'react-i18next';
import withChartData from 'iota-wallet-shared-modules/containers/components/Chart';
import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';
import GENERAL from '../theme/general';

const chartWidth = width * 0.98;
const chartHeight = height * 0.38;

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: height / 1000,
        borderRadius: GENERAL.borderRadiusSmall,
        paddingHorizontal: width / 50,
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
    emptyChartContainer: {
        flex: 5,
        width: width / 1.15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    emptyChartText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
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

const getChartCurrencySymbol = (currency) => {
    if (currency === 'BTC') {
        return isAndroid ? '฿' : '₿';
    } else if (currency === 'ETH') {
        return 'Ξ';
    } else if (currency === 'EUR') {
        return '€';
    }

    return '$';
};

/**
 * Chart component to display historical IOTA price charts
 */
class Chart extends PureComponent {
    static propTypes = {
        /* Current price data for selected currency */
        priceData: PropTypes.shape({
            currency: PropTypes.string.isRequired,
            symbol: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            volume: PropTypes.string.isRequired,
            change24h: PropTypes.string.isRequired,
            mcap: PropTypes.string.isRequired,
        }).isRequired,
        /* Chart data */
        chartData: PropTypes.shape({
            data: PropTypes.array.isRequired,
            timeframe: PropTypes.string.isRequired,
            yAxis: PropTypes.shape({
                ticks: PropTypes.array.isRequired,
            }),
        }).isRequired,
        /* Change chart currency */
        setCurrency: PropTypes.func.isRequired,
        /* Change chart time frame */
        setTimeframe: PropTypes.func.isRequired,
        /* Style price to current currency format
         * @param {Number} price value to format
         */
        getPriceFormat: PropTypes.func.isRequired,
        /* Theme settings
         * @ignore
         */
        theme: PropTypes.object.isRequired,
        /* Translation helper
         * @param {String} locale identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
        getPriceForCurrency: PropTypes.func.isRequired,
    };

    render() {
        const {
            t,
            priceData,
            chartData,
            theme,
            setCurrency,
            setTimeframe,
            getPriceFormat,
            getPriceForCurrency,
        } = this.props;

        const textColor = { color: theme.secondaryBackgroundColor };
        const borderColor = { borderColor: theme.secondaryBackgroundColor };
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={[styles.buttonContainer, borderColor]}>
                        <TouchableWithoutFeedback
                            onPress={() => setCurrency()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            style={{ alignItems: 'flex-start' }}
                        >
                            <View style={styles.button}>
                                <Text style={[styles.buttonText, textColor]}>{priceData.currency}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.iotaPrice, textColor]}>
                            {getChartCurrencySymbol(priceData.currency)}{' '}
                            {getPriceFormat(getPriceForCurrency(priceData.currency))} / Mi
                        </Text>
                    </View>
                    <View style={[styles.buttonContainer, borderColor]}>
                        <TouchableWithoutFeedback
                            onPress={() => setTimeframe()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                            style={{ alignItems: 'flex-start' }}
                        >
                            <View style={styles.button}>
                                <Text style={[styles.buttonText, textColor]}>{chartData.timeframe}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                {((chartData.data.length === 0 || chartData.data === undefined) && (
                    <View style={styles.emptyChartContainer}>
                        <Text style={[styles.emptyChartText, textColor]}>Error fetching chart data</Text>
                    </View>
                )) || (
                    <View style={styles.chartContainer}>
                        <VictoryChart domainPadding={isAndroid ? 0 : 15} height={chartHeight} width={chartWidth}>
                            <Defs>
                                <LinearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                    <Stop stopColor={theme.chartLineColorPrimary} stopOpacity="1" offset="100%" />
                                    <Stop stopColor={theme.chartLineColorSecondary} stopOpacity="1" offset="25%" />
                                </LinearGradient>
                            </Defs>
                            <VictoryLine
                                data={chartData.data}
                                style={{
                                    data: {
                                        stroke: 'url(#gradient)',
                                        strokeWidth: 1.2,
                                    },
                                }}
                                scale={{ x: 'time', y: 'linear' }}
                                animate={{
                                    duration: 450,
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                tickFormat={(x) => getPriceFormat(x)}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    tickLabels: {
                                        fill: theme.secondaryBackgroundColor,
                                        fontSize: width / 44,
                                        fontFamily: 'Lato-Regular',
                                    },
                                }}
                                gridComponent={
                                    <Line
                                        type="grid"
                                        style={{ stroke: theme.secondaryBackgroundColor, strokeWidth: 0.1 }}
                                    />
                                }
                                tickLabelComponent={<VictoryLabel x={width / 100} textAnchor="start" />}
                                tickValues={chartData.yAxis.ticks}
                            />
                        </VictoryChart>
                    </View>
                )}
                <View style={styles.marketDataContainer}>
                    <Text style={[styles.marketFigure, textColor]}>
                        <Text style={[styles.marketFigureTitle, textColor]}>{t('chart:mcap')}</Text> $ {priceData.mcap}
                    </Text>
                    <Text style={[styles.marketFigure, textColor]}>
                        <Text style={styles.marketFigureTitle}>{t('chart:change')}</Text> {priceData.change24h}%
                    </Text>
                    <Text style={[styles.marketFigure, textColor]}>
                        <Text style={styles.marketFigureTitle}>{t('chart:volume')}</Text> $ {priceData.volume}
                    </Text>
                </View>
                <View style={{ flex: 0.2 }} />
            </View>
        );
    }
}

export default translate('chart')(withChartData(Chart));
