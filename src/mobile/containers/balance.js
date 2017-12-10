import React from 'react';
import { StyleSheet, View, Text, ListView, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { setCurrency, setTimeframe } from 'iota-wallet-shared-modules/actions/marketData';
import { round, roundDown, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import SimpleTransactionRow from '../components/simpleTransactionRow';
import Chart from '../components/chart';

import { isAndroid } from '../util/device';
import { width, height } from '../util/dimensions';
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
        const { t } = this.props;
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        const addresses = Object.keys(currentSeedAccountInfo.addresses);
        const shortenedBalance =
            roundDown(formatValue(this.props.account.balance), 1) +
            (this.props.account.balance < 1000 || this.getDecimalPlaces(formatValue(this.props.account.balance)) <= 1
                ? ''
                : '+');
        const currencySymbol = getCurrencySymbol(this.props.settings.currency);
        const fiatBalance =
            this.props.account.balance * this.props.marketData.usdPrice / 1000000 * this.props.settings.conversionRate;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <View style={styles.balanceContainer}>
                        <Text style={styles.iotaBalance} onPress={event => this.onBalanceClick()}>
                            {this.state.balanceIsShort
                                ? shortenedBalance
                                : formatValue(this.props.account.balance)}{' '}
                            {formatUnit(this.props.account.balance)}
                        </Text>
                        <Text style={styles.fiatBalance}>
                            {currencySymbol} {round(fiatBalance, 2).toFixed(2)}{' '}
                        </Text>
                    </View>
                    <View style={styles.transactionsContainer}>
                        <View style={styles.line} />
                        <ListView
                            dataSource={ds.cloneWithRows(
                                accountInfo[Object.keys(accountInfo)[seedIndex]].transfers.slice(0, 4),
                            )}
                            renderRow={dataSource => (
                                <SimpleTransactionRow addresses={addresses} rowData={dataSource} />
                            )}
                            renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                            enableEmptySections
                            contentContainerStyle={styles.listView}
                            scrollEnabled={false}
                            centerContent
                        />
                        <View style={styles.line} />
                    </View>
                    <View style={styles.chartContainer}>
                        <Chart
                            isSendingTransfer={this.props.tempAccount.isSendingTransfer}
                            isGeneratingReceiveAddress={this.props.tempAccount.isGeneratingReceiveAddress}
                            isSyncing={this.props.tempAccount.isSyncing}
                            marketData={this.props.marketData}
                            setCurrency={currency => this.props.setCurrency(currency)}
                            setTimeframe={timeframe => this.props.setTimeframe(timeframe)}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    balanceContainer: {
        flex: 1.8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionsContainer: {
        flex: 2,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    chartContainer: {
        flex: 5,
        // paddingVertical: height / 100,
        // justifyContent: 'flex-end',
        //paddingVertical: isAndroid ? height / 80 : 0,
    },
    iotaBalance: {
        color: 'white',
        fontFamily: 'Lato-Heavy',
        fontSize: width / 8,
        backgroundColor: 'transparent',
    },
    fiatBalance: {
        color: 'white',
        paddingTop: height / 150,
        fontFamily: 'Lato-Regular',
        fontSize: width / 25,
        backgroundColor: 'transparent',
    },
    line: {
        borderBottomColor: '#999',
        borderBottomWidth: height / 1000,
        width: width / 1.2,
    },
    separator: {
        height: height / 120,
        flex: 1,
    },
    listView: {
        flex: 1,
        paddingVertical: height / 50,
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    account: state.account,
    tempAccount: state.tempAccount,
    settings: state.settings,
});

const mapDispatchToProps = dispatch => ({
    setCurrency: currency => {
        dispatch(setCurrency(currency));
    },
    setTimeframe: timeframe => {
        dispatch(setTimeframe(timeframe));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Balance);
