import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { LineChart, ResponsiveContainer, Line, YAxis, Tooltip } from 'recharts';
import { formatTimeAs, detectedTimezone } from 'libs/date';
import { withTranslation } from 'react-i18next';

import withChartData from 'containers/components/Chart';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import css from './chart.scss';

/**
 * Chart component to display historical IOTA price charts
 */
export class ChartComponent extends PureComponent {
    static propTypes = {
        /** Current price data for selected currency */
        priceData: PropTypes.shape({
            globalSymbol: PropTypes.string.isRequired,
            currency: PropTypes.string.isRequired,
            symbol: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            volume: PropTypes.string.isRequired,
            change24h: PropTypes.string.isRequired,
            mcap: PropTypes.string.isRequired,
        }).isRequired,
        /** Chart data */
        chartData: PropTypes.shape({
            data: PropTypes.array.isRequired,
            timeframe: PropTypes.string.isRequired,
            yAxis: PropTypes.shape({
                ticks: PropTypes.array,
            }),
        }).isRequired,
        /** @ignore */
        isAuthenticatedForMoonPay: PropTypes.bool.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Change chart currency */
        setCurrency: PropTypes.func.isRequired,
        /** Change chart time frame */
        setTimeframe: PropTypes.func.isRequired,
        /** Get current market price for a currency
         * @param {string} currency - Target currency
         */
        getPriceForCurrency: PropTypes.func.isRequired,
        /** Style price to current currency format
         * @param {number} price - Input price value for formatting
         */
        getPriceFormat: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    renderTooltip(props) {
        if (props.active) {
            const date = new Date(props.payload[0].payload.time * 1000);
            return (
                <p className={css.label}>
                    {formatTimeAs.dayMonthYearHoursMinutes(navigator.language, detectedTimezone, date)}
                    <br />
                    <strong>
                        {props.symbol} {props.payload[0].value}
                    </strong>
                </p>
            );
        }
    }

    render() {
        const {
            isAuthenticatedForMoonPay,
            history,
            priceData,
            chartData,
            theme,
            setCurrency,
            setTimeframe,
            getPriceFormat,
            getPriceForCurrency,
            t,
        } = this.props;

        return (
            <div className={css.chart}>
                <h3>MIOTA/{priceData.currency}</h3>
                <div>
                    {chartData.data.length ? (
                        <ResponsiveContainer height="100%" width="100%">
                            <LineChart data={chartData.data}>
                                <Line
                                    strokeWidth={2}
                                    type="natural"
                                    dataKey="y"
                                    stroke={theme.chart.color}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                                <YAxis
                                    strokeWidth={0}
                                    width={80}
                                    tick={{ fill: theme.body.color, dx: -56, textAnchor: 'start' }}
                                    tickCount={6}
                                    interval={0}
                                    tickFormatter={(tick) => getPriceFormat(tick)}
                                    ticks={chartData.yAxis.ticks}
                                    domain={['dataMin', 'dataMax']}
                                />
                                <Tooltip
                                    timeframe={chartData.timeframe}
                                    maxItems={chartData.data.length}
                                    symbol={priceData.symbol}
                                    content={this.renderTooltip}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <Icon icon="cross" size={128} />
                    )}
                </div>
                <footer>
                    <nav>
                        <Button variant="secondary" className="outline" onClick={() => setCurrency()}>
                            {priceData.currency}
                        </Button>
                        <Button
                            variant="secondary"
                            className="outline"
                            onClick={() =>
                                history.push(
                                    isAuthenticatedForMoonPay
                                        ? '/exchanges/moonpay/select-account'
                                        : '/exchanges/moonpay',
                                )
                            }
                        >
                            {t('moonpay:buyIOTA')}
                        </Button>
                        <Button variant="secondary" className="outline" onClick={() => setTimeframe()}>
                            {chartData.timeframe.replace('1m', '28d')}
                        </Button>
                    </nav>
                    <ul>
                        <li>
                            <strong>{t('chart:mcap')}: </strong>
                            {priceData.globalSymbol} {priceData.mcap}
                        </li>
                        <li>
                            <strong>{t('chart:currentValue')}: </strong>
                            {priceData.symbol} {getPriceFormat(getPriceForCurrency(priceData.currency))} / Mi
                        </li>
                        <li>
                            <strong>{t('chart:change')}:</strong> {priceData.change24h}%
                        </li>
                    </ul>
                </footer>
            </div>
        );
    }
}

export default withTranslation()(withChartData(ChartComponent));
