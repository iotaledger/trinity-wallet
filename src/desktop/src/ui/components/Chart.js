import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory';

import withChartData from 'containers/components/Chart';

import Button from 'ui/components/Button';
import css from './chart.css';

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

    render() {
        const { priceData, chartData, theme, setCurrency, setTimeframe, getPriceFormat, t } = this.props;

        return (
            <div className={css.chart}>
                <div>
                    <VictoryChart>
                        <VictoryLine
                            data={chartData.data}
                            style={{
                                data: {
                                    stroke: theme.chart.color,
                                    strokeWidth: 1.2,
                                },
                            }}
                            scale={{ x: 'time', y: 'linear' }}
                            animate={{
                                duration: 1500,
                                onLoad: { duration: 2000 },
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            tickFormat={(x) => getPriceFormat(x)}
                            tickValues={chartData.yAxis.ticks}
                            style={{
                                axis: { stroke: 'transparent' },
                                tickLabels: { fill: theme.body.color, fontSize: 8, fontFamily: 'Lato-Regular' },
                                ticks: { padding: 0 },
                            }}
                            gridComponent={<Line type="grid" style={{ stroke: theme.body.alt, strokeWidth: 0.1 }} />}
                            tickLabelComponent={<VictoryLabel x={0} textAnchor="start" />}
                        />
                    </VictoryChart>
                </div>
                <nav>
                    <Button variant="secondary" className="outline" onClick={() => setCurrency()}>
                        {priceData.currency}
                    </Button>
                    <p>
                        {priceData.symbol} {getPriceFormat(priceData.price)} / Mi
                    </p>
                    <Button variant="secondary" className="outline" onClick={() => setTimeframe()}>
                        {chartData.timeframe}
                    </Button>
                </nav>
                <ul>
                    <li>
                        {t('mcap')}: $ {priceData.mcap}
                    </li>
                    <li>
                        {t('Change')}: {priceData.change24h}%
                    </li>
                    <li>
                        {t('Volume')} (24h): $ {priceData.volume}
                    </li>
                </ul>
            </div>
        );
    }
}

export default withChartData(Chart);
