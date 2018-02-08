import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, ListView, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { setCurrency, setTimeframe } from 'iota-wallet-shared-modules/actions/marketData';
import { round, roundDown, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import SimpleTransactionRow from '../components/simpleTransactionRow';
import Chart from '../components/chart';
import {
    getAddressesForSelectedAccountViaSeedIndex,
    getDeduplicatedTransfersForSelectedAccountViaSeedIndex,
    getBalanceForSelectedAccountViaSeedIndex,
} from '../../shared/selectors/account';
import { width, height } from '../util/dimensions';

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
        fontFamily: 'Lato-Heavy',
        fontSize: width / 8,
        backgroundColor: 'transparent',
    },
    fiatBalance: {
        paddingTop: height / 150,
        fontFamily: 'Lato-Regular',
        fontSize: width / 25,
        backgroundColor: 'transparent',
    },
    noTransactions: {
        fontFamily: 'Lato-Light',
        fontSize: width / 37.6,
        backgroundColor: 'transparent',
    },
    line: {
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
        extraColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        chartLineColorPrimary: PropTypes.string.isRequired,
        chartLineColorSecondary: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        closeTopBar: PropTypes.func.isRequired,
    };

    static getDecimalPlaces(n) {
        const s = `${+n}`;
        const match = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);

        if (!match) {
            return 0;
        }

        return Math.max(0, (match[1] === '0' ? 0 : (match[1] || '').length) - (match[2] || 0));
    }

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
            negativeColor,
            extraColor,
            secondaryBackgroundColor,
            chartLineColorPrimary,
            chartLineColorSecondary,
        } = this.props;

        const shortenedBalance =
            roundDown(formatValue(balance), 1) +
            (balance < 1000 || Balance.getDecimalPlaces(formatValue(balance)) <= 1 ? '' : '+');
        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = balance * marketData.usdPrice / 1000000 * settings.conversionRate;
        const recentTransactions = transfers.slice(0, 4);
        const hasTransactions = recentTransactions.length > 0;
        const textColor = { color: secondaryBackgroundColor };
        const lineBorder = { borderBottomColor: secondaryBackgroundColor };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <View style={styles.balanceContainer}>
                        <Text style={[styles.iotaBalance, textColor]} onPress={() => this.onBalanceClick()}>
                            {this.state.balanceIsShort ? shortenedBalance : formatValue(balance)} {formatUnit(balance)}
                        </Text>
                        <Text style={[styles.fiatBalance, textColor]}>
                            {currencySymbol} {round(fiatBalance, 2).toFixed(2)}{' '}
                        </Text>
                    </View>
                    <View style={styles.transactionsContainer}>
                        <View style={[styles.line, lineBorder]} />
                        {hasTransactions ? (
                            <ListView
                                dataSource={ds.cloneWithRows(recentTransactions)}
                                renderRow={dataSource => (
                                    <SimpleTransactionRow
                                        negativeColor={negativeColor}
                                        extraColor={extraColor}
                                        addresses={addresses}
                                        rowData={dataSource}
                                        secondaryBackgroundColor={secondaryBackgroundColor}
                                    />
                                )}
                                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                                enableEmptySections
                                contentContainerStyle={styles.listView}
                                scrollEnabled={false}
                                centerContent
                            />
                        ) : (
                            <View style={styles.listView}>
                                <Text style={[styles.noTransactions, textColor]}>{t('global:noTransactions')}</Text>
                            </View>
                        )}
                        <View style={[styles.line, lineBorder]} />
                    </View>
                    <View style={styles.chartContainer}>
                        <Chart
                            isSendingTransfer={isSendingTransfer}
                            isGeneratingReceiveAddress={isGeneratingReceiveAddress}
                            isSyncing={isSyncing}
                            marketData={marketData}
                            setCurrency={currency => this.props.setCurrency(currency)}
                            setTimeframe={timeframe => this.props.setTimeframe(timeframe)}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            textColor={{ color: secondaryBackgroundColor }}
                            borderColor={{ borderColor: secondaryBackgroundColor }}
                            chartLineColorPrimary={chartLineColorPrimary}
                            chartLineColorSecondary={chartLineColorSecondary}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = ({ tempAccount, account, marketData, settings }) => ({
    marketData,
    isSendingTransfer: tempAccount.isSendingTransfer,
    isGeneratingReceiveAddress: tempAccount.isGeneratingReceiveAddress,
    isSyncing: tempAccount.isSyncing,
    seedIndex: tempAccount.seedIndex,
    balance: getBalanceForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    addresses: getAddressesForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    transfers: getDeduplicatedTransfersForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    settings,
    negativeColor: settings.theme.negativeColor,
    extraColor: settings.theme.extraColor,
    secondaryBackgroundColor: settings.theme.secondaryBackgroundColor,
    chartLineColorPrimary: settings.theme.chartLineColorPrimary,
    chartLineColorSecondary: settings.theme.chartLineColorSecondary,
});

const mapDispatchToProps = dispatch => ({
    setCurrency: currency => {
        dispatch(setCurrency(currency));
    },
    setTimeframe: timeframe => {
        dispatch(setTimeframe(timeframe));
    },
});

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(Balance));
