import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient, Defs, Stop } from 'react-native-svg';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory-native';
import { translate } from 'react-i18next';
import withChartData from 'iota-wallet-shared-modules/containers/components/Chart';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import GENERAL from '../theme/general';

const chartWidth = width;
const chartHeight = height * 0.36;

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderRadius: width / 25,
        paddingHorizontal: width / 35,
        paddingVertical: height / 110,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    topContainer: {
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
        flex: 4.7,
        width: width / 1.15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
        paddingLeft: width / 8.95,
    },
    emptyChartContainer: {
        flex: 4.7,
        width: width / 1.15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    emptyChartText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
    },
    marketDataContainer: {
        flex: 1.3,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: width / 1.15,
    },
    buttonText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize1,
    },
    iotaPrice: {
        fontWeight: 'normal',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
    },
    marketFigure: {
        fontWeight: 'normal',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
        marginTop: height / 200
    },
    marketFigureTitle: {
        fontSize: GENERAL.fontSize2,
        fontFamily: 'SourceSansPro-Bold',
        opacity: 0.6
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
        const volumeFormatted = priceData.volume.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        const mcapFormatted = priceData.mcap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        const textColor = { color: theme.body.color };
        const borderColor = { borderColor: theme.secondary.color };
        return (
            <View style={styles.container}>
                <View style={{ flex: 0.65 }} />
                <View style={styles.topContainer}>
                    <TouchableOpacity
                        onPress={() => setCurrency()}
                        hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                        style={[styles.button, borderColor]}
                    >
                        <Text style={[styles.buttonText, textColor]}>{priceData.currency}</Text>
                    </TouchableOpacity>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.iotaPrice, textColor]}>
                            {getChartCurrencySymbol(priceData.currency)}{' '}
                            {getPriceFormat(getPriceForCurrency(priceData.currency))} / Mi
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setTimeframe()}
                        hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                        style={[styles.button, borderColor]}
                    >
                        <Text style={[styles.buttonText, textColor]}>{chartData.timeframe}</Text>
                    </TouchableOpacity>
                </View>
                {chartData.data.length === 0 || chartData.data === undefined ? (
                    <View style={styles.emptyChartContainer}>
                        <Text style={[styles.emptyChartText, textColor]}>Error fetching chart data</Text>
                    </View>
                ) : (
                    <View style={styles.chartContainer}>
                        <VictoryChart domainPadding={isAndroid ? 0 : 15} height={chartHeight} width={chartWidth}>
                            <Defs>
                                <LinearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                    <Stop stopColor={theme.chart.color} stopOpacity="1" offset="100%" />
                                    <Stop stopColor={theme.chart.color} stopOpacity="1" offset="25%" />
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
                                interpolation='basis'
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
                                        fill: theme.body.color,
                                        fontSize: GENERAL.fontSize0,
                                        fontFamily: 'SourceSansPro-Regular',
                                    },
                                }}
                                gridComponent={
                                    <Line type="grid" style={{ stroke: theme.body.color, strokeWidth: 0.05 }} />
                                }
                                tickLabelComponent={<VictoryLabel x={width / 100} textAnchor="start" />}
                                tickValues={chartData.yAxis.ticks}
                            />
                        </VictoryChart>
                    </View>
                )}
                <View style={styles.marketDataContainer}>
                    <View style={{ alignItems: 'flex-start' }}>
                        <Text style={[styles.marketFigureTitle, textColor]}>{t('chart:mcap')}</Text>
                        <Text style={[styles.marketFigure, textColor]}>{priceData.globalSymbol} {mcapFormatted}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[ styles.marketFigureTitle, textColor ]}>{t('chart:change')}</Text>
                        <Text style={[styles.marketFigure, textColor]}>{priceData.change24h}%</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[ styles.marketFigureTitle, textColor ]}>{t('chart:volume')}</Text>
                        <Text style={[styles.marketFigure, textColor]}>{priceData.globalSymbol} {volumeFormatted}</Text>
                    </View>
                </View>
                <View style={{ flex: 0.38 }} />
            </View>
        );
    }
}

export default translate('chart')(withChartData(Chart));
