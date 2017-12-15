import React from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory';
import PropTypes from 'prop-types';
import Button from 'components/UI/Button';
import css from './Chart.css';

import imageChewron from 'images/chevron-down.png';

const getChartCurrencySymbol = currency => {
    if (currency === 'BTC') {
        return '₿';
    } else if (currency === 'ETH') {
        return 'Ξ';
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
    USD: 'BTC',
    BTC: 'ETH',
    ETH: 'USD',
};

export default class Chart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            price: props.marketData.usdPrice,
        };
    }

    componentWillMount() {
        switch (this.props.marketData.currency) {
            case 'USD':
                this.setState({ price: this.props.marketData.usdPrice });
                break;
            case 'BTC':
                this.setState({ price: this.props.marketData.btcPrice });
                break;
            case 'ETH':
                this.setState({ price: this.props.marketData.ethPrice });
                break;
        }
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

    getMaxY() {
        const { marketData } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        const maxValue = Math.max(
            ...data.map(object => {
                return object.y;
            }),
        );
        return maxValue;
    }

    getMinY() {
        const { marketData } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        const minValue = Math.min(
            ...data.map(object => {
                return object.y;
            }),
        );
        return minValue;
    }

    getMaxX() {
        const { marketData } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        const maxValue = Math.max(
            ...data.map(object => {
                return object.x;
            }),
        );
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

        if (marketData.currency === 'USD') {
            return x.toFixed(3);
        } else if (marketData.currency === 'BTC') {
            return x.toFixed(6);
        }

        return x.toFixed(5);
    }

    render() {
        const { price } = this.state;
        const { marketData } = this.props;
        const data = marketData.chartData[marketData.currency][marketData.timeframe];
        return (
            <div className={css.chart}>
                <nav>
                    <Button variant="default" className="small" onClick={event => this.changeCurrency()}>
                        <img src={imageChewron} />
                        {marketData.currency}
                    </Button>
                    <p>
                        {getChartCurrencySymbol(marketData.currency)} {this.getPriceFormat(price)} / Mi
                    </p>
                    <Button variant="default" className="small" onClick={event => this.changeTimeframe()}>
                        <img src={imageChewron} />
                        {marketData.timeframe}
                    </Button>
                </nav>
                <div>
                    <VictoryChart>
                        <defs>
                            <linearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                <stop stopColor="#FFA25B" stopOpacity={1} offset="100%" />
                                <stop stopColor="#FFFFFF" stopOpacity={0.25} offset="0%" />
                            </linearGradient>
                        </defs>
                        <VictoryLine
                            data={data}
                            style={{
                                data: {
                                    stroke: 'url(#gradient)',
                                    strokeWidth: 1.2,
                                },
                            }}
                            domain={{
                                x: [-1, this.getMaxX() + 1],
                                y: [this.getMinY(), this.getMaxY()],
                            }}
                            scale={{ x: 'time', y: 'linear' }}
                            animate={{
                                duration: 1500,
                                onLoad: { duration: 2000 },
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            tickFormat={x => this.getPriceFormat(x)}
                            style={{
                                axis: { stroke: 'transparent' },
                                tickLabels: { fill: 'white', fontSize: 9, fontFamily: 'Lato-Regular' },
                                ticks: { padding: 0 },
                            }}
                            gridComponent={<Line type={'grid'} style={{ stroke: 'white', strokeWidth: 0.1 }} />}
                            tickLabelComponent={<VictoryLabel x={0} textAnchor="start" />}
                            tickValues={this.getTickValues()}
                            domain={{
                                y: [this.getMinY(), this.getMaxY()],
                            }}
                        />
                    </VictoryChart>
                </div>
                <ul>
                    <li>MCAP: $ {marketData.mcap}</li>
                    <li>Change: {marketData.change24h}%</li>
                    <li>Volume (24h): $ {marketData.volume}</li>
                </ul>
            </div>
        );
    }
}
