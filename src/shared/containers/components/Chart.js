import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { round } from '../../libs/utils';

import { setCurrency, setTimeframe } from '../../actions/marketData';
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
            setTimeframe: PropTypes.func.isRequired,
            setCurrency: PropTypes.func.isRequired,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
        };

        currencies = ['USD', 'EUR', 'BTC', 'ETH']; // eslint-disable-line react/sort-comp
        timeframes = ['24h', '7d', '1m', '1h'];

        changeCurrency = () => {
            const { marketData, setCurrency } = this.props;
            const nextCurrency = this.currencies[
                this.currencies.indexOf(marketData.currency) < this.currencies.length - 1
                    ? this.currencies.indexOf(marketData.currency) + 1
                    : 0
            ];
            setCurrency(nextCurrency);
        };

        changeTimeframe = () => {
            const { marketData, setTimeframe } = this.props;
            const nextTimeframe = this.timeframes[
                this.timeframes.indexOf(marketData.timeframe) < this.timeframes.length - 1
                    ? this.timeframes.indexOf(marketData.timeframe) + 1
                    : 0
            ];
            setTimeframe(nextTimeframe);
        };

        getPriceFormat = (x) => {
            const { marketData } = this.props;
            return marketData.currency === 'USD' || marketData.currency === 'EUR'
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

        render() {
            const { marketData, settings, theme, t } = this.props;

            const currencyData = get(marketData.chartData, marketData.currency);
            const dataSet = get(currencyData, marketData.timeframe) || [];

            const chartProps = {
                setCurrency: this.changeCurrency,
                setTimeframe: this.changeTimeframe,
                getPriceFormat: this.getPriceFormat,
                getPriceForCurrency: this.getPriceForCurrency,
                priceData: {
                    currency: marketData.currency,
                    symbol: getCurrencySymbol(marketData.currency),
                    price: this.props.marketData.usdPrice,
                    volume: round(marketData.volume * settings.conversionRate).toLocaleString('en'),
                    change24h: marketData.change24h,
                    mcap: round(marketData.mcap * settings.conversionRate).toLocaleString('en'),
                    globalSymbol: getCurrencySymbol(settings.currency),
                },
                chartData: {
                    timeframe: marketData.timeframe,
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
    });

    const mapDispatchToProps = {
        setCurrency,
        setTimeframe,
    };

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(ChartData));
}
