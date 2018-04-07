import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { round, roundDown } from 'iota-wallet-shared-modules/libs/utils';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import {
    getTransfersForSelectedAccount,
    getBalanceForSelectedAccount,
} from 'iota-wallet-shared-modules/selectors/accounts';
import { getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import SimpleTransactionRow from '../components/SimpleTransactionRow';
import Chart from '../components/Chart';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import TextWithLetterSpacing from '../components/TextWithLetterSpacing';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    balanceContainer: {
        flex: 2.2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionsContainer: {
        flex: 1.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        flex: 5,
    },
    iotaBalance: {
        fontFamily: 'Lato-Light',
        fontSize: width / 8,
        backgroundColor: 'transparent',
        paddingBottom: isAndroid ? null : height / 110,
    },
    fiatBalance: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 25,
        backgroundColor: 'transparent',
    },
    noTransactions: {
        fontFamily: 'Lato-Light',
        fontSize: width / 37.6,
        backgroundColor: 'transparent',
    },
    separator: {
        height: height / 120,
    },
    listView: {
        flex: 1,
        justifyContent: 'center',
    },
});

/**
 * Balance screen component
 */
export class Balance extends Component {
    static propTypes = {
        usdPrice: PropTypes.number.isRequired,
        /** Index of currently selected account in accountNames list */
        seedIndex: PropTypes.number.isRequired,
        /** Balance for currently selected account */
        balance: PropTypes.number.isRequired,
        /** Transactions for currently selected account */
        transfers: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Close active top bar */
        closeTopBar: PropTypes.func.isRequired,
        /** Switches bottom tabs on home screen
         * @param {string} - Default to 'history'
         */
        onTabSwitch: PropTypes.func.isRequired,
        /** Currently selected currency */
        currency: PropTypes.string.isRequired,
        /** Currency coversion rate */
        conversionRate: PropTypes.number.isRequired,
        primary: PropTypes.object.isRequired,
        secondary: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
    };

    /**
     * Make balance human-readable
     * @param  {int} n Balance
     * @return {int}   Human-readable balance
     */
    static getDecimalPlaces(n) {
        const s = `+${n}`;
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

    /**
     * Show full balance or show abbreviated balance
     */
    onBalanceClick() {
        if (this.state.balanceIsShort) {
            this.setState({ balanceIsShort: false });
        } else {
            this.setState({ balanceIsShort: true });
        }
    }

    /**
     * Formats transaction data
     * @return {Array} Formatted transaction data
     */

    prepTransactions() {
        const { transfers, t, primary, secondary, body } = this.props;
        const orderedTransfers = orderBy(transfers, (tx) => tx.timestamp, ['desc']);
        const recentTransactions = orderedTransfers.slice(0, 4);

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

        const formattedTransfers = map(recentTransactions, (transfer) => {
            const { timestamp, incoming, persistence, transferValue } = transfer;
            
            return {
                time: timestamp,
                confirmationStatus: computeConfirmationStatus(persistence, incoming),
                value: round(formatValue(transferValue), 1),
                unit: formatUnit(transferValue),
                sign: getSign(transferValue, incoming),
                incoming,
                style: {
                    titleColor: incoming ? primary.color : secondary.color,
                    defaultTextColor: { color: body.color },
                    iconColor: body.color,
                },
            };
        });

        return formattedTransfers;
    }

    renderTransactions() {
        const { body, t } = this.props;
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
                    <Text style={[styles.noTransactions, { color: body.color }]}>{t('global:noTransactions')}</Text>
                )}
            />
        );
    }

    render() {
        const { balance, conversionRate, currency, usdPrice, body } = this.props;

        const shortenedBalance =
            roundDown(formatValue(balance), 1) +
            (balance < 1000 || Balance.getDecimalPlaces(formatValue(balance)) <= 1 ? '' : '+');
        const currencySymbol = getCurrencySymbol(currency);
        const fiatBalance = balance * usdPrice / 1000000 * conversionRate;
        const textColor = { color: body.color };
        const recentTransactions = this.renderTransactions();
        const text = (this.state.balanceIsShort ? shortenedBalance : formatValue(balance)) + ' ' + formatUnit(balance);

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <TouchableWithoutFeedback onPress={() => this.onBalanceClick()}>
                        <View style={styles.balanceContainer}>
                            <TextWithLetterSpacing spacing={width / 200} textStyle={[styles.iotaBalance, textColor]}>
                                {text}
                            </TextWithLetterSpacing>
                            <Text style={[styles.fiatBalance, textColor]}>
                                {currencySymbol} {round(fiatBalance, 2).toFixed(2)}{' '}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <View style={styles.transactionsContainer}>
                        <TouchableOpacity onPress={() => this.props.onTabSwitch('history')}>
                            {recentTransactions}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.chartContainer}>
                        <Chart />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    usdPrice: state.marketData.usdPrice,
    seedIndex: state.wallet.seedIndex,
    balance: getBalanceForSelectedAccount(state),
    transfers: getTransfersForSelectedAccount(state),
    currency: state.settings.currency,
    conversionRate: state.settings.conversionRate,
    primary: state.settings.theme.primary,
    secondary: state.settings.theme.secondary,
    body: state.settings.theme.body,
});

export default translate(['global'])(connect(mapStateToProps)(Balance));
