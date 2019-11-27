import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { round } from '../../libs/utils';

import { setChartCurrency, setChartTimeframe } from '../../actions/settings';
import { getCurrencySymbol } from '../../libs/currency';

import { getThemeFromState } from '../../selectors/global';

/**
 * Chart component container
 * @ignore
 */
export default function withChartData(ChartComponent) {
    class ChartData extends React.Component {
        static propTypes = {
            settings: PropTypes.object.isRequired,
            marketData: PropTypes.object.isRequired,
            setChartTimeframe: PropTypes.func.isRequired,
            setChartCurrency: PropTypes.func.isRequired,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            /** @ignore */
            isAuthenticated: PropTypes.bool.isRequired,
            history: PropTypes.object.isRequired,
        };

        currencies = ['USD', 'EUR', 'BTC', 'ETH']; // eslint-disable-line react/sort-comp
        timeframes = ['24h', '7d', '1m', '1h'];

        getPriceFormat = (x) => {
            const { settings } = this.props;
            return settings.chartCurrency === 'USD' || settings.chartCurrency === 'EUR'
                ? parseFloat(x).toFixed(3)
                : parseFloat(x).toFixed(6);
        };

        getPriceForCurrency = (x) => {
            const { marketData } = this.props;
            switch (x) {
                case 'USD':
                    return marketData.usdPrice;
                case 'EUR':
                    return marketData.eurPrice;
                case 'BTC':
                    return marketData.btcPrice;
                case 'ETH':
                    return marketData.ethPrice;
            }
        };

        getTicks(dataSet) {
            if (dataSet === undefined || dataSet.length === 0) {
                return;
            }

            const limit = dataSet.reduce(
                (range, data) => ({
                    min: Math.min(range.min, data.y),
                    max: Math.max(range.max, data.y),
                }),
                { min: dataSet[0].y, max: dataSet[0].y },
            );

            const range = limit.max - limit.min;

            return Array.from({ length: 6 }, (value, index) => limit.min + range * index * 0.2);
        }

        changeCurrency = () => {
            const { settings, setChartCurrency } = this.props;
            const nextCurrency = this.currencies[
                this.currencies.indexOf(settings.chartCurrency) < this.currencies.length - 1
                    ? this.currencies.indexOf(settings.chartCurrency) + 1
                    : 0
            ];
            setChartCurrency(nextCurrency);
        };

        changeTimeframe = () => {
            const { settings, setChartTimeframe } = this.props;
            const nextTimeframe = this.timeframes[
                this.timeframes.indexOf(settings.chartTimeframe) < this.timeframes.length - 1
                    ? this.timeframes.indexOf(settings.chartTimeframe) + 1
                    : 0
            ];
            setChartTimeframe(nextTimeframe);
        };

        render() {
            const { history, isAuthenticated, marketData, settings, theme, t } = this.props;

            const currencyData = get(marketData.chartData, settings.chartCurrency.toLowerCase());
            const rawData = get(currencyData, settings.chartTimeframe) || [];

            rawData.sort((a, b) => a[0] - b[0]);

            const dataSet = rawData.map(([time, price], index) => {
                return { x: index, y: parseFloat(price), time: time };
            });
            const chartProps = {
                history,
                isAuthenticatedForMoonPay: isAuthenticated,
                setCurrency: this.changeCurrency,
                setTimeframe: this.changeTimeframe,
                getPriceFormat: this.getPriceFormat,
                getPriceForCurrency: this.getPriceForCurrency,
                priceData: {
                    currency: settings.chartCurrency,
                    symbol: getCurrencySymbol(settings.chartCurrency),
                    price: this.props.marketData.usdPrice,
                    volume: round(marketData.volume * settings.conversionRate).toLocaleString('en'),
                    change24h: marketData.change24h,
                    mcap: round(marketData.mcap * settings.conversionRate).toLocaleString('en'),
                    globalSymbol: getCurrencySymbol(settings.chartCurrency),
                },
                chartData: {
                    timeframe: settings.chartTimeframe,
                    data: dataSet,
                    yAxis: {
                        ticks: this.getTicks(dataSet),
                    },
                },
                theme,
                t,
            };

            return <ChartComponent {...chartProps} />;
        }
    }

    ChartData.displayName = `withChartData(${ChartComponent.displayName || ChartComponent.name})`;

    const mapStateToProps = (state) => ({
        marketData: state.marketData,
        settings: state.settings,
        theme: getThemeFromState(state),
        isAuthenticated: state.exchanges.moonpay.isAuthenticated,
    });

    const mapDispatchToProps = {
        setChartCurrency,
        setChartTimeframe,
    };

    return connect(mapStateToProps, mapDispatchToProps)(ChartData);
}
