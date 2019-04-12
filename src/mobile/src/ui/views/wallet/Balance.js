import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { round, roundDown } from 'shared-modules/libs/utils';
import { computeStatusText, formatRelevantRecentTransactions } from 'shared-modules/libs/iota/transfers';
import { setAnimateChartOnMount } from 'shared-modules/actions/ui';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import {
    getTransactionsForSelectedAccount,
    getBalanceForSelectedAccount,
    getAddressesForSelectedAccount,
} from 'shared-modules/selectors/accounts';
import { getCurrencySymbol } from 'shared-modules/libs/currency';
import { getThemeFromState } from 'shared-modules/selectors/global';
import WithManualRefresh from 'ui/components/ManualRefresh';
import SimpleTransactionRow from 'ui/components/SimpleTransactionRow';
import Chart from 'ui/components/Chart';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import TextWithLetterSpacing from 'ui/components/TextWithLetterSpacing';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        flex: 1.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartContainer: {
        flex: 5.1,
    },
    iotaBalance: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize7,
        backgroundColor: 'transparent',
    },
    iotaUnit: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        marginTop: height / 36,
        paddingLeft: width / 40,
    },
    fiatBalance: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
    },
    noTransactions: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize1,
        backgroundColor: 'transparent',
    },
    separator: {
        height: height / 120,
    },
    listView: {
        flex: 1,
        justifyContent: 'center',
    },
    iotaBalanceContainer: {
        paddingBottom: isAndroid ? null : height / 200,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/**
 * Balance screen component
 */
export class Balance extends Component {
    static propTypes = {
        /** @ignore */
        usdPrice: PropTypes.number.isRequired,
        /** @ignore */
        seedIndex: PropTypes.number.isRequired,
        /** Balance for currently selected account */
        balance: PropTypes.number.isRequired,
        /** Transactions for currently selected account */
        transactions: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Close active top bar */
        closeTopBar: PropTypes.func.isRequired,
        /** Switches bottom tabs on home screen
         * @param {string} - Default to 'history'
         */
        onTabSwitch: PropTypes.func.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        conversionRate: PropTypes.number.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isRefreshing: PropTypes.bool.isRequired,
        /** Fetches latest account info on swipe down */
        onRefresh: PropTypes.func.isRequired,
        /** Addresses for selected account */
        addresses: PropTypes.array.isRequired,
        /** @ignore */
        setAnimateChartOnMount: PropTypes.func.isRequired,
        /** @ignore */
        animateChartOnMount: PropTypes.bool.isRequired,
    };

    /**
     * Make balance human-readable
     * @param {int} n Balance
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

    componentDidMount() {
        leaveNavigationBreadcrumb('Balance');
        this.props.setAnimateChartOnMount(false);
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
        const { transactions, theme, addresses } = this.props;
        const { primary, secondary, body } = theme;
        const orderedTransfers = orderBy(transactions, (tx) => tx.timestamp, ['desc']);
        const recentTransactions = orderedTransfers.slice(0, 4);
        const relevantTransactions = formatRelevantRecentTransactions(recentTransactions, addresses);

        const getSign = (value, incoming) => {
            if (value === 0) {
                return '';
            }
            return incoming ? '+' : '-';
        };
        const formattedTransfers = map(relevantTransactions, (transfer) => {
            const { outputs, timestamp, incoming, persistence, transferValue } = transfer;

            return {
                time: timestamp,
                confirmationStatus: computeStatusText(outputs, persistence, incoming),
                value: round(formatValue(transferValue), 1),
                unit: formatUnit(transferValue),
                sign: getSign(transferValue, incoming),
                icon: incoming ? 'plus' : 'minus',
                incoming,
                style: {
                    titleColor: persistence ? (incoming ? primary.color : secondary.color) : '#fc6e6d',
                    pendingColor: '#fc6e6d',
                    defaultTextColor: body.color,
                    iconColor: body.color,
                },
            };
        });

        return formattedTransfers;
    }

    renderTransactions() {
        const { theme, t } = this.props;
        const { body } = theme;
        const data = this.prepTransactions();

        return (
            <FlatList
                scrollEnabled={false}
                data={data}
                keyExtractor={(item, index) => index.toString()}
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
        const { balance, conversionRate, currency, usdPrice, theme, isRefreshing, animateChartOnMount } = this.props;
        const { body, primary } = theme;

        const shortenedBalance =
            roundDown(formatValue(balance), 1) +
            (balance < 1000 || Balance.getDecimalPlaces(formatValue(balance)) <= 1 ? '' : '+');
        const currencySymbol = getCurrencySymbol(currency);
        const fiatBalance = balance * usdPrice / 1000000 * conversionRate;
        const textColor = { color: body.color };
        const recentTransactions = this.renderTransactions();
        const iotaBalance = this.state.balanceIsShort ? shortenedBalance : formatValue(balance);
        const iotaUnit = formatUnit(balance);

        return (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={this.props.onRefresh}
                        tintColor={primary.color}
                    />
                }
                contentContainerStyle={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                    <View style={styles.container}>
                        <TouchableWithoutFeedback onPress={() => this.onBalanceClick()}>
                            <View style={styles.balanceContainer}>
                                <View style={styles.iotaBalanceContainer}>
                                    <TextWithLetterSpacing
                                        spacing={width / 100}
                                        textStyle={[styles.iotaBalance, textColor]}
                                    >
                                        {iotaBalance}
                                    </TextWithLetterSpacing>
                                    <Text style={[styles.iotaUnit, textColor]}>{iotaUnit}</Text>
                                </View>
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
                            <Chart animateChartOnMount={animateChartOnMount} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </ScrollView>
        );
    }
}

const mapStateToProps = (state) => ({
    usdPrice: state.marketData.usdPrice,
    seedIndex: state.wallet.seedIndex,
    balance: getBalanceForSelectedAccount(state),
    transactions: getTransactionsForSelectedAccount(state),
    addresses: getAddressesForSelectedAccount(state),
    currency: state.settings.currency,
    conversionRate: state.settings.conversionRate,
    theme: getThemeFromState(state),
    animateChartOnMount: state.ui.animateChartOnMount,
});

const mapDispatchToProps = {
    setAnimateChartOnMount,
};

export default WithManualRefresh()(withNamespaces(['global'])(connect(mapStateToProps, mapDispatchToProps)(Balance)));
