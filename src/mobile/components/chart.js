import React from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Svg, LinearGradient, Defs, Stop } from 'react-native-svg';
import { VictoryLine, VictoryAxis, Line, VictoryLabel } from 'victory-native';

const { height, width } = Dimensions.get('window');

const viewbox = `${width / 4.7} ${height / 61.3} ${width / 3.45} ${height / 3.555}`;

class Chart extends React.Component {
    componentDidMount() {
        polling = setInterval(() => {
            this.props.getMarketData();
            this.props.getChartData(this.props.marketData.currency, this.props.marketData.timeFrame);
            this.props.getPrice(this.props.marketData.currency);
            console.log('Updating chart');
        }, 90000);
    }

    onCurrencyClick() {
        switch (this.props.marketData.currency) {
            case 'USD':
                this.props.changeCurrency('BTC', this.props.marketData.timeFrame);
                break;
            case 'BTC':
                this.props.changeCurrency('ETH', this.props.marketData.timeFrame);
                break;
            case 'ETH':
                this.props.changeCurrency('USD', this.props.marketData.timeFrame);
                break;
        }
    }

    onTimeFrameClick() {
        switch (this.props.marketData.timeFrame) {
            case '24h':
                this.props.changeTimeFrame(this.props.marketData.currency, '7d');
                break;
            case '7d':
                this.props.changeTimeFrame(this.props.marketData.currency, '1m');
                break;
            case '1m':
                this.props.changeTimeFrame(this.props.marketData.currency, '1h');
                break;
            case '1h':
                this.props.changeTimeFrame(this.props.marketData.currency, '6h');
                break;
            case '6h':
                this.props.changeTimeFrame(this.props.marketData.currency, '24h');
                break;
        }
    }

    getMaxY() {
        const maxValue = Math.max(
            ...this.props.marketData.chartData.map(object => {
                return object.y;
            }),
        );
        return maxValue;
    }

    getMinY() {
        const minValue = Math.min(
            ...this.props.marketData.chartData.map(object => {
                return object.y;
            }),
        );
        return minValue;
    }

    getMaxX() {
        const maxValue = Math.max(
            ...this.props.marketData.chartData.map(object => {
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

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={event => this.onCurrencyClick()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                        >
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>{this.props.marketData.currency}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={styles.iotaPrice}>{this.props.marketData.price} / Mi</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableWithoutFeedback
                            onPress={event => this.onTimeFrameClick()}
                            hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
                        >
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>{this.props.marketData.timeFrame}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
                <View style={styles.chartContainer}>
                    <Svg height={height / 3.2} width={width / 1.2} viewBox={viewbox}>
                        <Defs>
                            <LinearGradient x1="0%" y1="0%" x2="100%" y2="0%" id="gradient">
                                <Stop stopColor="#FFA25B" stopOpacity="1" offset="100%" />
                                <Stop stopColor="#FFFFFF" stopOpacity="0.25" offset="0%" />
                            </LinearGradient>
                        </Defs>

                        <VictoryAxis
                            dependentAxis
                            standalone={false}
                            style={{
                                axis: { stroke: 'transparent' },
                                tickLabels: { fill: 'white', fontSize: width / 44, fontFamily: 'Lato-Regular' },
                            }}
                            height={height / 3.2}
                            width={width / 1.2}
                            gridComponent={<Line type={'grid'} style={{ stroke: 'white', strokeWidth: 0.25 }} />}
                            tickLabelComponent={<VictoryLabel x={0} textAnchor="start" />}
                            tickValues={this.getTickValues()}
                            domain={{
                                y: [this.getMinY(), this.getMaxY()],
                            }}
                        />
                        <VictoryLine
                            data={this.props.marketData.chartData}
                            style={{
                                data: {
                                    stroke: 'url(#gradient)',
                                    strokeWidth: 2,
                                },
                            }}
                            domain={{
                                x: [-1, this.getMaxX() + 1],
                                y: [this.getMinY(), this.getMaxY()],
                            }}
                            scale={{ x: 'time', y: 'linear' }}
                            height={height / 3.2}
                            width={width / 1.2}
                            standalone={false}
                            animate={{
                                duration: 1500,
                                onLoad: { duration: 2000 },
                            }}
                        />
                    </Svg>
                </View>
                <View style={styles.marketDataContainer}>
                    <Text style={styles.marketFigure}>MCAP: $ {this.props.marketData.mcap}</Text>
                    <Text style={styles.marketFigure}>Change: {this.props.marketData.change24h}%</Text>
                    <Text style={styles.marketFigure}>Volume (24h): $ {this.props.marketData.volume}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: height / 80,
    },
    topContainer: {
        flex: 0.7,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1,
    },
    priceContainer: {
        flex: 8,
        alignItems: 'center',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        flex: 3.3,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    marketDataContainer: {
        flex: 0.6,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
    },
    iotaPrice: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Lato-Regular',
        fontSize: width / 24,
    },
    marketFigure: {
        color: 'white',
        fontWeight: 'bold',
        fontFamily: 'Lato-Regular',
        fontSize: width / 37.6,
    },
});

module.exports = Chart;
