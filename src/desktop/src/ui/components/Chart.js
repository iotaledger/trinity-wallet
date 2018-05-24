import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { LineChart, ResponsiveContainer, Line, YAxis, Tooltip } from 'recharts';
import { format, addHours, subDays, subHours, subMinutes } from 'date-fns';

import withChartData from 'containers/components/Chart';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import css from './chart.scss';

/**
 * Chart component to display historical IOTA price charts
 */
class Chart extends PureComponent {
    static propTypes = {
        /** Current price data for selected currency */
        priceData: PropTypes.shape({
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
                ticks: PropTypes.array.isRequired,
            }),
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
        /** Theme settings
         * @ignore
         */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    renderTooltip(props) {
        if (props.active) {
            const distance = props.maxItems - props.payload[0].payload.x;

            let date = subHours(new Date(), 24 * distance / props.maxItems);

            switch (props.timeframe) {
                case '1h':
                    date = subMinutes(new Date(), 60 * distance / props.maxItems);
                    break;
                case '7d':
                    date = subHours(new Date(), 24 * 7 * distance / props.maxItems);
                    break;
                case '1m':
                    date = subDays(new Date(), 30 * distance / props.maxItems);
                    break;
                case '24h':
                    date = addHours(date, 1);
                    break;
            }

            return (
                <p className={css.label}>
                    {format(date, 'DD.MM.YY HH:mm')}
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
                                />
                                <YAxis
                                    strokeWidth={0}
                                    width={55}
                                    tickMargin={10}
                                    tick={{ fill: theme.body.color }}
                                    tickCount={6}
                                    interval={0}
                                    ticks={
                                        chartData.yAxis.ticks
                                            ? chartData.yAxis.ticks.map((tick) => getPriceFormat(tick))
                                            : null
                                    }
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
                        <p>
                            {priceData.symbol} {getPriceFormat(getPriceForCurrency(priceData.currency))} / Mi
                        </p>
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
                            <strong>{t('chart:change')}:</strong> {priceData.change24h}%
                        </li>
                        <li>
                            <strong>{t('chart:volume')}: </strong>
                            {priceData.globalSymbol} {priceData.volume}
                        </li>
                    </ul>
                </footer>
            </div>
        );
    }
}

export default withChartData(Chart);
