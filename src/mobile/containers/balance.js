import map from 'lodash/map';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { round, roundDown, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import whiteSendImagePath from 'iota-wallet-shared-modules/images/send-white.png';
import whiteReceiveImagePath from 'iota-wallet-shared-modules/images/receive-white.png';
import blackSendImagePath from 'iota-wallet-shared-modules/images/send-black.png';
import blackReceiveImagePath from 'iota-wallet-shared-modules/images/receive-black.png';
import { getRelevantTransfer, isReceivedTransfer } from 'iota-wallet-shared-modules/libs/iota/transfers';
import {
    getAddressesForSelectedAccountViaSeedIndex,
    getDeduplicatedTransfersForSelectedAccountViaSeedIndex,
    getBalanceForSelectedAccountViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import SimpleTransactionRow from '../components/simpleTransactionRow';
import Chart from '../components/chart';
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
    },
    listView: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: height / 50,
    },
});

export class Balance extends Component {
    static propTypes = {
        marketData: PropTypes.object.isRequired,
        seedIndex: PropTypes.number.isRequired,
        balance: PropTypes.number.isRequired,
        addresses: PropTypes.array.isRequired,
        transfers: PropTypes.array.isRequired,
        settings: PropTypes.object.isRequired,
        extraColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
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

    shouldComponentUpdate(newProps) {
        const { marketData } = this.props;
        if (newProps.marketData !== marketData) return false;
        return true;
    }

    onBalanceClick() {
        if (this.state.balanceIsShort) {
            this.setState({ balanceIsShort: false });
        } else {
            this.setState({ balanceIsShort: true });
        }
    }

    prepTransactions() {
        const { transfers, addresses, t, extraColor, negativeColor, secondaryBackgroundColor } = this.props;
        const recentTransactions = transfers.slice(0, 4);

        const computeConfirmationStatus = (persistence, incoming) => {
            if (incoming) {
                return persistence ? t('received') : t('receiving');
            }

            return persistence ? t('sent') : t('sending');
        };

        const getSign = (value, incoming) => {
            if (value === 0) {
                return '';
            }

            return incoming ? '+' : '-';
        };

        const isSecondaryBackgroundColorWhite = secondaryBackgroundColor === 'white';

        const outgoingIconPath = isSecondaryBackgroundColorWhite ? whiteSendImagePath : blackSendImagePath;
        const incomingIconPath = isSecondaryBackgroundColorWhite ? whiteReceiveImagePath : blackReceiveImagePath;

        return map(recentTransactions, (transfer) => {
            const tx = getRelevantTransfer(transfer, addresses);
            const incoming = isReceivedTransfer(transfer, addresses);

            return {
                time: tx.timestamp,
                confirmationStatus: computeConfirmationStatus(tx.persistence, incoming),
                value: round(formatValue(tx.value), 1),
                unit: formatUnit(tx.value),
                sign: getSign(tx.value, incoming),
                iconPath: incoming ? incomingIconPath : outgoingIconPath,
                style: {
                    titleColor: incoming ? extraColor : negativeColor,
                    defaultTextColor: { color: secondaryBackgroundColor },
                },
            };
        });
    }

    renderTransactions() {
        const { secondaryBackgroundColor, t } = this.props;
        const data = this.prepTransactions();

        return (
            <FlatList
                scrollEnabled={false}
                data={data}
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => <SimpleTransactionRow {...item} />}
                contentContainerStyle={styles.listView}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => (
                    <Text style={[styles.noTransactions, { color: secondaryBackgroundColor }]}>
                        {t('global:noTransactions')}
                    </Text>
                )}
            />
        );
    }

    render() {
        const { balance, settings, marketData, secondaryBackgroundColor } = this.props;

        const shortenedBalance =
            roundDown(formatValue(balance), 1) +
            (balance < 1000 || Balance.getDecimalPlaces(formatValue(balance)) <= 1 ? '' : '+');
        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = balance * marketData.usdPrice / 1000000 * settings.conversionRate;
        const textColor = { color: secondaryBackgroundColor };
        const lineBorder = { borderBottomColor: secondaryBackgroundColor };
        const recentTransactions = this.renderTransactions();
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
                        {recentTransactions}
                        <View style={[styles.line, lineBorder]} />
                    </View>
                    <View style={styles.chartContainer}>
                        <Chart />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = ({ tempAccount, account, marketData, settings }) => ({
    marketData,
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

export default translate(['global'])(connect(mapStateToProps)(Balance));
