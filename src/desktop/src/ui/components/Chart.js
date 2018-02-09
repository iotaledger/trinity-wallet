import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory';

import withChartData from 'containers/components/Chart';

import Icon from 'ui/components/Icon';
import Button from 'ui/components/Button';
import css from './chart.css';

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
         * @param {number} price - Input price value for formatting
         */
        getPriceFormat: PropTypes.func.isRequired,
        /* Theme settings
         * @ignore
         */
        theme: PropTypes.object.isRequired,
        /* Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { priceData, chartData, theme, setCurrency, setTimeframe, getPriceFormat, t } = this.props;

        return (
            <div className={css.chart}>
                <nav>
                    <Button variant="secondary" className="small" onClick={() => setCurrency()}>
                        <Icon icon="chevron" size={8} />
                        {priceData.currency}
                    </Button>
                    <p>
                        {priceData.symbol} {getPriceFormat(priceData.price)} / Mi
                    </p>
                    <Button variant="secondary" className="small" onClick={() => setTimeframe()}>
                        <Icon icon="chevron" size={8} />
                        {chartData.timeframe}
                    </Button>
                </nav>
                <div>
                    <svg>
                        <defs>
                            <linearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                <stop stopColor={theme.body.background} offset="0%" />
                                <stop stopColor={theme.chart.color} offset="100%" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <VictoryChart>
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
                                tickLabels: { fill: 'white', fontSize: 9, fontFamily: 'Lato-Regular' },
                                ticks: { padding: 0 },
                            }}
                            gridComponent={<Line type="grid" style={{ stroke: 'white', strokeWidth: 0.1 }} />}
                            tickLabelComponent={<VictoryLabel x={0} textAnchor="start" />}
                        />
                    </VictoryChart>
                </div>
                <ul>
                    <li>MCAP: $ {priceData.mcap}</li>
                    <li>Change: {priceData.change24h}%</li>
                    <li>Volume (24h): $ {priceData.volume}</li>
                </ul>
            </div>
        );
    }
}

export default withChartData(Chart);
