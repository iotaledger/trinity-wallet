import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient, Defs, Stop } from 'react-native-svg';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory-native';
import { withTranslation } from 'react-i18next';
import withChartData from 'shared-modules/containers/components/Chart';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import navigator from 'libs/navigation';

const chartWidth = width;
const chartHeight = isAndroid ? height * 0.4 : height * 0.36;

const styles = StyleSheet.create({
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderRadius: width / 25,
        paddingHorizontal: width / 30,
        paddingVertical: height / 100,
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
    midButtonContainer: {
        flex: 4,
        alignItems: 'center',
        borderRadius: width / 25,
        marginHorizontal: width / 6.5,
        paddingVertical: height / 100 + 1,
    },
    chartContainer: {
        flex: 4.7,
        width: Styling.contentWidth,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
        paddingLeft: width / 8.95,
    },
    emptyChartContainer: {
        flex: 4.7,
        width: Styling.contentWidth,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    emptyChartText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
    },
    marketDataContainer: {
        flex: 1.3,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: Styling.contentWidth,
    },
    buttonText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize1,
    },
    iotaPrice: {
        fontWeight: 'normal',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
    },
    marketFigure: {
        fontWeight: 'normal',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        marginTop: height / 200,
    },
    marketFigureTitle: {
        fontSize: Styling.fontSize2,
        fontFamily: 'SourceSansPro-Bold',
        opacity: 0.6,
    },
});

/**
 * Gets the symbol for a currency
 * @param  {string} currency Currency abbreviation
 * @return {string}          Currency symbol
 */
const getChartCurrencySymbol = (currency) => {
    if (currency === 'BTC') {
        // The official BTC symbol is not available on some Android devices
        // To mitigate a crash, the Thai Baht symbol is used instead
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
        /* @ignore */
        priceData: PropTypes.shape({
            currency: PropTypes.string.isRequired,
            globalSymbol: PropTypes.string.isRequired,
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
        /* @ignore */
        setCurrency: PropTypes.func.isRequired,
        /* @ignore */
        setTimeframe: PropTypes.func.isRequired,
        /* Style price to current currency format
         * @param {number} price value to format
         */
        getPriceFormat: PropTypes.func.isRequired,
        /* @ignore */
        theme: PropTypes.object.isRequired,
        /* @ignore */
        t: PropTypes.func.isRequired,
        /**
         * Gets price for a specific currency
         * @param {string} currency
         */
        getPriceForCurrency: PropTypes.func.isRequired,
        /* @ignore */
        animateChartOnMount: PropTypes.bool.isRequired,
        /** @ignore */
        isAuthenticatedForMoonPay: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            animate: props.animateChartOnMount,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Chart');
    }

    componentWillReceiveProps(newProps) {
        if (this.props.chartData !== newProps.chartData) {
            this.setState({ animate: true });
        }
    }

    render() {
        const {
            isAuthenticatedForMoonPay,
            t,
            priceData,
            chartData,
            theme,
            setCurrency,
            setTimeframe,
            getPriceFormat,
            getPriceForCurrency,
        } = this.props;

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
                    <TouchableOpacity
                        onPress={() => navigator.push(isAuthenticatedForMoonPay ? 'selectAccount' : 'landing')}
                        style={[
                            styles.midButtonContainer,
                            {
                                backgroundColor: theme.secondary.color,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                {
                                    color: theme.body.bg,
                                },
                            ]}
                        >
                            {t('moonpay:buyIOTA')}
                        </Text>
                    </TouchableOpacity>
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
                        <Text style={[styles.emptyChartText, textColor]}>{t('chart:error')}</Text>
                    </View>
                ) : (
                    <View style={styles.chartContainer}>
                        <VictoryChart domainPadding={height / 50} height={chartHeight} width={chartWidth}>
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
                                interpolation="natural"
                                animate={
                                    this.state.animate && {
                                        duration: 450,
                                        onExit: {},
                                    }
                                }
                            />
                            <VictoryAxis
                                dependentAxis
                                tickFormat={(x) => getPriceFormat(x)}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    tickLabels: {
                                        fill: theme.body.color,
                                        fontSize: Styling.fontSize0,
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
                        <Text style={[styles.marketFigure, textColor]}>{`$ ${priceData.mcap}`}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.marketFigureTitle, textColor]}>{t('chart:currentValue')}</Text>
                        <Text style={[styles.marketFigure, textColor]}>
                            {getChartCurrencySymbol(priceData.currency)}{' '}
                            {getPriceFormat(getPriceForCurrency(priceData.currency))} / Mi
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.marketFigureTitle, textColor]}>{t('chart:change')}</Text>
                        <Text style={[styles.marketFigure, textColor]}>{priceData.change24h}%</Text>
                    </View>
                </View>
                <View style={{ flex: 0.38 }} />
            </View>
        );
    }
}

export default withTranslation('chart')(withChartData(Chart));
