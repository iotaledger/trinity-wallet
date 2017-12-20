import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, ListView, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { setCurrency, setTimeframe } from 'iota-wallet-shared-modules/actions/marketData';
import { round, roundDown, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import SimpleTransactionRow from '../components/simpleTransactionRow';
import Chart from '../components/chart';
import {
    getAddressesForSelectedAccountViaSeedIndex,
    getDeduplicatedTransfersForSelectedAccountViaSeedIndex,
} from '../../shared/selectors/account';

import { width, height } from '../util/dimensions';
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class Balance extends Component {
    static propTypes = {
        marketData: PropTypes.object.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        seedIndex: PropTypes.number.isRequired,
        balance: PropTypes.number.isRequired,
        addresses: PropTypes.array.isRequired,
        transfers: PropTypes.array.isRequired,
        settings: PropTypes.object.isRequired,
        setCurrency: PropTypes.func.isRequired,
        setTimeframe: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            balanceIsShort: true,
        };
    }

    componentWillReceiveProps(newProps) {
        if (newProps.seedIndex !== this.props.seedIndex) {
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
        const s = '' + +n;
        const match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);

        if (!match) {
            return 0;
        }

        return Math.max(0, (match[1] == '0' ? 0 : (match[1] || '').length) - (match[2] || 0));
    }

    render() {
        const {
            t,
            balance,
            settings,
            marketData,
            transfers,
            addresses,
            isSendingTransfer,
            isGeneratingReceiveAddress,
            isSyncing,
        } = this.props;

        const shortenedBalance =
            roundDown(formatValue(balance), 1) +
            (balance < 1000 || this.getDecimalPlaces(formatValue(balance)) <= 1 ? '' : '+');
        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = balance * marketData.usdPrice / 1000000 * settings.conversionRate;
        const recentTransactions = transfers.slice(0, 4);
        const hasTransactions = recentTransactions.length > 0;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <View style={styles.balanceContainer}>
                        <Text style={styles.iotaBalance} onPress={event => this.onBalanceClick()}>
                            {this.state.balanceIsShort ? shortenedBalance : formatValue(balance)} {formatUnit(balance)}
                        </Text>
                        <Text style={styles.fiatBalance}>
                            {currencySymbol} {round(fiatBalance, 2).toFixed(2)}{' '}
                        </Text>
                    </View>
                    <View style={styles.transactionsContainer}>
                        <View style={styles.line} />
                        {hasTransactions ? (
                            <ListView
                                dataSource={ds.cloneWithRows(recentTransactions)}
                                renderRow={dataSource => (
                                    <SimpleTransactionRow addresses={addresses} rowData={dataSource} />
                                )}
                                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                                enableEmptySections
                                contentContainerStyle={styles.listView}
                                scrollEnabled={false}
                                centerContent
                            />
                        ) : (
                            <View style={styles.listView}>
                                <Text style={styles.noTransactions}>NO RECENT HISTORY</Text>
                            </View>
                        )}
                        <View style={styles.line} />
                    </View>
                    <View style={styles.chartContainer}>
                        <Chart
                            isSendingTransfer={isSendingTransfer}
                            isGeneratingReceiveAddress={isGeneratingReceiveAddress}
                            isSyncing={isSyncing}
                            marketData={marketData}
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
        paddingVertical: height / 70,
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
    noTransactions: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 37.6,
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
        justifyContent: 'center',
        paddingVertical: height / 50,
    },
});

const mapStateToProps = ({ tempAccount, account, marketData, settings }) => ({
    marketData,
    isSendingTransfer: tempAccount.isSendingTransfer,
    isGeneratingReceiveAddress: tempAccount.isGeneratingReceiveAddress,
    isSyncing: tempAccount.isSyncing,
    seedIndex: tempAccount.seedIndex,
    balance: account.balance,
    addresses: getAddressesForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    transfers: getDeduplicatedTransfersForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    settings,
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
