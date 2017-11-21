import React from 'react';
import { StyleSheet, View, Text, ListView, Dimensions, StatusBar, Platform } from 'react-native';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice, setCurrency, setTimeframe } from '../../shared/actions/marketData';
import { round, roundDown, formatValue, formatUnit } from '../../shared/libs/util';
import SimpleTransactionRow from '../components/simpleTransactionRow';
import Chart from '../components/chart';

const isAndroid = Platform.OS === 'android';
const width = Dimensions.get('window').width;
const height = global.height;
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class Balance extends React.Component {
    constructor() {
        super();
        this.state = {
            balanceIsShort: true,
        };
    }

    componentWillReceiveProps(newProps) {
        if (newProps.tempAccount.seedIndex != this.props.tempAccount.seedIndex) {
            this.setState({ balanceIsShort: true });
        }
    }

    onBalanceClick() {
        if (this.state.balanceIsShort) {
            this.setState({ balanceIsShort: false });
        } else {
            this.setState({ balanceIsShort: true });
        }
    }

    getDecimalPlaces(n) {
        var s = '' + +n;
        var match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);
        if (!match) {
            return 0;
        }
        return Math.max(0, (match[1] == '0' ? 0 : (match[1] || '').length) - (match[2] || 0));
    }

    render() {
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        const addresses = Object.keys(currentSeedAccountInfo.addresses);
        const shortenedBalance =
            roundDown(formatValue(this.props.account.balance), 1) +
            (this.props.account.balance < 1000 || this.getDecimalPlaces(formatValue(this.props.account.balance)) <= 1
                ? ''
                : '+');
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.balanceContainer}>
                    <Text style={styles.iotaBalance} onPress={event => this.onBalanceClick()}>
                        {this.state.balanceIsShort ? shortenedBalance : formatValue(this.props.account.balance)}{' '}
                        {formatUnit(this.props.account.balance)}
                    </Text>
                    <Text style={styles.fiatBalance}>
                        $ {round(this.props.account.balance * this.props.marketData.usdPrice / 1000000, 2).toFixed(
                            2,
                        )}{' '}
                    </Text>
                </View>
                <View style={styles.transactionsContainer}>
                    <View style={styles.line} />
                    <ListView
                        dataSource={ds.cloneWithRows(
                            accountInfo[Object.keys(accountInfo)[seedIndex]].transfers.slice(0, 4),
                        )}
                        renderRow={dataSource => <SimpleTransactionRow addresses={addresses} rowData={dataSource} />}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                        contentContainerStyle={isAndroid ? styles.listViewAndroid : styles.listViewIos}
                        scrollEnabled={false}
                        centerContent
                    />
                    <View style={styles.line} />
                </View>
                <View style={{ flex: 5 }}>
                    <Chart
                        marketData={this.props.marketData}
                        getPrice={() => this.props.getPrice()}
                        getChartData={() => this.props.getChartData()}
                        getMarketData={() => this.props.getMarketData()}
                        setCurrency={currency => this.props.setCurrency(currency)}
                        setTimeframe={timeframe => this.props.setTimeframe(timeframe)}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    balanceContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: height / 50,
        paddingBottom: isAndroid ? height / 10 : height / 20,
    },
    iotaBalance: {
        color: 'white',
        fontFamily: 'Lato-Heavy',
        fontSize: width / 9,
        backgroundColor: 'transparent',
    },
    fiatBalance: {
        color: 'white',
        paddingTop: 5,
        fontFamily: 'Lato-Regular',
        fontSize: width / 25,
        backgroundColor: 'transparent',
    },
    transactionsContainer: {
        flex: 2.5,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: height / 150,
    },
    line: {
        borderBottomColor: 'white',
        borderBottomWidth: 0.25,
        width: width / 1.15,
    },
    separator: {
        height: height / 90,
        flex: 1,
    },
    listViewAndroid: {
        flex: 1,
        paddingVertical: height / 70,
    },
    listViewIos: {
        paddingTop: height / 90,
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    account: state.account,
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = dispatch => ({
    getMarketData: () => {
        dispatch(getMarketData());
    },
    getPrice: () => {
        dispatch(getPrice());
    },
    getChartData: () => {
        dispatch(getChartData());
    },
    setCurrency: currency => {
        dispatch(setCurrency(currency));
    },
    setTimeframe: timeframe => {
        dispatch(setTimeframe(timeframe));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Balance);
