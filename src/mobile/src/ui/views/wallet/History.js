import merge from 'lodash/merge';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    Linking,
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { generateAlert } from 'shared-modules/actions/alerts';
import { computeStatusText, formatRelevantTransactions } from 'shared-modules/libs/iota/transfers';
import { promoteTransaction, retryFailedTransaction } from 'shared-modules/actions/transfers';
import { convertFiatToMiota } from 'shared-modules/exchanges/MoonPay/utils';
import {
    getTransactionsForSelectedAccount,
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAddressesForSelectedAccount,
} from 'shared-modules/selectors/accounts';
import { MOONPAY_TRANSACTION_STATUSES, SHORT_IOTA_CURRENCY_CODE } from 'shared-modules/exchanges/MoonPay';
import { updateTransactionDetails as updateMoonPayTransactionDetails } from 'shared-modules/actions/exchanges/MoonPay';
import { getAllTransactions } from 'shared-modules/selectors/exchanges/MoonPay';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SeedStore from 'libs/SeedStore';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { round } from 'shared-modules/libs/utils';
import { toggleModalActivity, updateModalProps, setViewingMoonpayPurchases } from 'shared-modules/actions/ui';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import WithManualRefresh from 'ui/components/ManualRefresh';
import TransactionRow from 'ui/components/TransactionRow';
import MoonPayPurchaseRow from 'ui/components/exchanges/MoonPay/PurchaseRow';
import RequireLoginView from 'ui/components/exchanges/MoonPay/RequireLoginView';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import CtaButton from 'ui/components/CtaButton';
import InfoBox from 'ui/components/InfoBox';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { Styling } from 'ui/theme/general';
import navigator from 'libs/navigation';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    list: {
        height: height * 0.5 + height / 15,
        justifyContent: 'center',
    },
    noTransactionsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    flatList: {
        flex: 1,
        justifyContent: 'center',
    },
    refreshButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isAndroid ? null : height / 50,
    },
    activityIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 5,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
        paddingBottom: height / 25,
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        height: height / 10,
        width,
    },
    leftHeaderButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 10,
        width: width / 2,
    },
    rightHeaderButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 10,
        width: width / 2,
    },
    buttonText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize3,
    },
});

/** History screen component */
class History extends Component {
    static propTypes = {
        /** Transactions for selected account */
        transactions: PropTypes.object.isRequired,
        /** Close active top bar */
        closeTopBar: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Account meta for selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        promoteTransaction: PropTypes.func.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** @ignore */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        isPromotingTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        mode: PropTypes.string.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        isAutoPromoting: PropTypes.bool.isRequired,
        /** @ignore */
        currentlyPromotingBundleHash: PropTypes.string.isRequired,
        /** @ignore */
        isRefreshing: PropTypes.bool.isRequired,
        /** @ignore */
        isAuthenticatedForMoonPay: PropTypes.bool.isRequired,
        /** Fetches latest account info on swipe down */
        onRefresh: PropTypes.func.isRequired,
        /** Addresses for selected account */
        addresses: PropTypes.array.isRequired,
        /** @ignore */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** @ignore */
        isRetryingFailedTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        updateModalProps: PropTypes.func.isRequired,
        /** @ignore */
        modalProps: PropTypes.object,
        /** @ignore */
        isModalActive: PropTypes.bool,
        /** @ignore */
        modalContent: PropTypes.string,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        moonpayPurchases: PropTypes.array.isRequired,
        /** @ignore */
        isViewingMoonpayPurchases: PropTypes.bool.isRequired,
        /** @ignore */
        setViewingMoonpayPurchases: PropTypes.func.isRequired,
        /** @ignore */
        updateMoonPayTransactionDetails: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('History');
    }

    componentWillReceiveProps(newProps) {
        const {
            isRetryingFailedTransaction,
            isAutoPromoting,
            isPromotingTransaction,
            modalProps,
            isModalActive,
            modalContent,
            theme: { primary, secondary },
        } = this.props;

        // FIXME: Overly-complex ugly code. Think of a new updateModalProps approach.
        if (isModalActive && modalContent === 'transactionHistory') {
            const newBundleProps = newProps.transactions[modalProps.bundle];
            if (
                isRetryingFailedTransaction !== newProps.isRetryingFailedTransaction ||
                isAutoPromoting !== newProps.isAutoPromoting ||
                isPromotingTransaction !== newProps.isPromotingTransaction
            ) {
                this.props.updateModalProps({
                    disableWhen:
                        newProps.isAutoPromoting ||
                        newProps.isPromotingTransaction ||
                        newProps.isRetryingFailedTransaction,
                    isRetryingFailedTransaction: newProps.isRetryingFailedTransaction,
                    isFailedTransaction: !newBundleProps.broadcasted,
                    bundleIsBeingPromoted:
                        newProps.currentlyPromotingBundleHash === modalProps.bundle && !newBundleProps.persistence,
                });
            }
            if (modalProps.bundle in newProps.transactions && newBundleProps.persistence !== modalProps.persistence) {
                this.props.updateModalProps({
                    persistence: newBundleProps.persistence,
                    outputs: newBundleProps.outputs,
                    incoming: newBundleProps.incoming,
                    style: { titleColor: modalProps.incoming ? primary.color : secondary.color },
                });
            }
        }
    }

    shouldComponentUpdate(newProps) {
        const { isSyncing, isSendingTransfer, isGeneratingReceiveAddress, isTransitioning } = this.props;
        if (isSyncing !== newProps.isSyncing) {
            return false;
        }
        if (isSendingTransfer !== newProps.isSendingTransfer) {
            return false;
        }
        if (isGeneratingReceiveAddress !== newProps.isGeneratingReceiveAddress) {
            return false;
        }
        if (isTransitioning !== newProps.isTransitioning) {
            return false;
        }
        return true;
    }

    async promoteTransaction(bundle) {
        const { selectedAccountMeta, selectedAccountName } = this.props;
        const seedStore = await new SeedStore[selectedAccountMeta.type](global.passwordHash);
        this.props.promoteTransaction(bundle, selectedAccountName, seedStore);
    }

    async retryFailedTransaction(bundle) {
        const { selectedAccountMeta, selectedAccountName } = this.props;
        const seedStore = await new SeedStore[selectedAccountMeta.type](global.passwordHash);
        this.props.retryFailedTransaction(selectedAccountName, bundle, seedStore);
    }

    /**
     * Formats transaction data
     * @return {Array} Formatted transaction data
     */
    prepIOTATransactions() {
        const {
            transactions,
            theme: { primary, secondary, body, bar, dark },
            mode,
            t,
            currentlyPromotingBundleHash,
            isRefreshing,
            addresses,
            isAutoPromoting,
            isPromotingTransaction,
            isRetryingFailedTransaction,
        } = this.props;
        const relevantTransfers = formatRelevantTransactions(transactions, addresses);

        const withUnitAndChecksum = (item) => ({
            address: `${item.address}${item.checksum}`,
            value: round(formatValue(item.value), 1),
            unit: formatUnit(item.value),
        });

        const formattedTransfers = map(relevantTransfers, (transfer) => {
            const {
                timestamp,
                incoming,
                persistence,
                transferValue,
                inputs,
                outputs,
                bundle,
                message,
                broadcasted,
            } = transfer;
            const value = round(formatValue(transferValue), 1);
            return {
                t,
                persistence,
                value,
                fullValue: formatValue(transferValue),
                unit: formatUnit(transferValue),
                time: timestamp,
                message,
                mode,
                incoming,
                addresses,
                icon: incoming ? 'plus' : 'minus',
                bundleIsBeingPromoted: currentlyPromotingBundleHash === bundle && !persistence,
                status: computeStatusText(outputs, persistence, incoming),
                outputs,
                isFailedTransaction: !broadcasted,
                updateModalProps: (content) => this.props.updateModalProps(content),
                onPress: (props) => {
                    if (isRefreshing) {
                        return;
                    }
                    this.props.toggleModalActivity(
                        'transactionHistory',
                        merge({}, props, {
                            disableWhen: isAutoPromoting || isPromotingTransaction || isRetryingFailedTransaction,
                            isRetryingFailedTransaction,
                            currentlyPromotingBundleHash,
                            retryFailedTransaction: (bundle) => this.retryFailedTransaction(bundle),
                            promote: (bundle) => this.promoteTransaction(bundle),
                            hideModal: () => this.props.toggleModalActivity(),
                            generateAlert: (type, title, message) => this.props.generateAlert(type, title, message),
                            bundle,
                            relevantAddresses: [
                                ...map(inputs, withUnitAndChecksum),
                                ...map(outputs, withUnitAndChecksum),
                            ],
                        }),
                    );
                },
                style: {
                    titleColor: persistence ? (incoming ? primary.color : secondary.color) : '#fc6e6d',
                    pendingColor: '#fc6e6d',
                    containerBackgroundColor: { backgroundColor: dark.color },
                    defaultTextColor: { color: body.color },
                    rowTextColor: { color: dark.body },
                    backgroundColor: body.bg,
                    borderColor: { borderColor: body.color },
                    barBg: bar.bg,
                    primaryColor: primary.color,
                    primaryBody: primary.body,
                    secondaryColor: secondary.color,
                    secondaryBody: secondary.body,
                    barColor: bar.color,
                },
            };
        });

        return orderBy(formattedTransfers, 'time', ['desc']);
    }

    /**
     * Formats MoonPay purchase data
     *
     * @method prepMoonPayPurchases
     *
     * @return {array} Formatted MoonPay purchase data
     */
    prepMoonPayPurchases() {
        const {
            moonpayPurchases,
            theme: { primary, body, dark, negative },
            t,
            exchangeRates,
        } = this.props;

        const formattedTransfers = map(moonpayPurchases, (purchase) => {
            const {
                currencyCode,
                status,
                walletAddress,
                createdAt,
                feeAmount,
                failureReason,
                baseCurrencyAmount,
                quoteCurrencyAmount,
                cryptoTransactionId,
                redirectUrl,
            } = purchase;

            const amount =
                quoteCurrencyAmount ||
                // quoteCurrencyAmount is set to null for failed transactions,
                // Hence compute it locally
                convertFiatToMiota(baseCurrencyAmount, currencyCode, exchangeRates);

            return {
                time: createdAt,
                address: walletAddress,
                statusText: t(`moonpay:${status}`),
                status,
                fee: feeAmount,
                currencyCode,
                t,
                value: round(formatValue(amount), 1),
                fullValue: formatValue(amount),
                fiatValue: baseCurrencyAmount,
                failureReason,
                unit: SHORT_IOTA_CURRENCY_CODE,
                onPress: (props) => {
                    this.props.toggleModalActivity(
                        'moonpayPurchaseDetails',
                        merge({}, props, {
                            shouldDisplayAuthorizationOption:
                                status === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization,
                            authorize: () => {
                                this.props.updateMoonPayTransactionDetails(merge({}, purchase, { active: true }));
                                Linking.openURL(redirectUrl);
                            },
                            hideModal: () => this.props.toggleModalActivity(),
                            generateAlert: (type, title, message) => this.props.generateAlert(type, title, message),
                            bundle: cryptoTransactionId,
                        }),
                    );
                },
                style: {
                    backgroundColor: body.bg,
                    defaultTextColor: { color: body.color },
                    titleColor: body.color,
                    containerBackgroundColor: { backgroundColor: dark.color },
                    rowTextColor: { color: dark.body },
                    primaryColor: primary.color,
                    failedColor: negative.color,
                },
            };
        });

        return orderBy(formattedTransfers, 'time', ['asc']);
    }

    /**
     * Renders MoonPay purchase history
     *
     * @method renderMoonPayPurchases
     *
     * @returns {object}
     */
    renderMoonPayPurchases() {
        const {
            isAuthenticatedForMoonPay,
            theme: { primary, body },
            t,
            isRefreshing
        } = this.props;
        if (isAuthenticatedForMoonPay) {
            const purchaseHistory = this.prepMoonPayPurchases();
            const noPurchases = purchaseHistory.length === 0;

            return (
                <OptimizedFlatList
                    contentContainerStyle={noPurchases ? styles.flatList : null}
                    data={purchaseHistory}
                    initialNumToRender={8}
                    removeClippedSubviews
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => <MoonPayPurchaseRow {...item} />}
                    scrollEnabled={purchaseHistory.length > 0}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing && !noPurchases}
                            onRefresh={this.props.onRefresh}
                            tintColor={primary.color}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.noTransactionsContainer}>
                            <InfoBox>
                                <Text style={[styles.infoText, { color: body.color }]}>
                                    {t('moonpay:emptyHistory')}
                                </Text>
                                <CtaButton
                                    ctaColor={primary.color}
                                    ctaBorderColor={primary.color}
                                    secondaryCtaColor={primary.body}
                                    text={t('moonpay:buyIOTA')}
                                    onPress={() => {
                                        navigator.push('selectAccount');
                                    }}
                                    ctaWidth={width / 2}
                                    ctaHeight={height / 12}
                                />
                            </InfoBox>
                        </View>
                    }
                />
            );
        }

        return <RequireLoginView />;
    }

    renderIOTATransactions() {
        const {
            theme: { primary, body },
            t,
            isRefreshing,
        } = this.props;
        const data = this.prepIOTATransactions();
        const noTransactions = data.length === 0;

        return (
            <OptimizedFlatList
                contentContainerStyle={noTransactions ? styles.flatList : null}
                data={data}
                initialNumToRender={8} // TODO: Should be dynamically computed.
                removeClippedSubviews
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <TransactionRow {...item} />}
                scrollEnabled={data.length > 0}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing && !noTransactions}
                        onRefresh={this.props.onRefresh}
                        tintColor={primary.color}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.noTransactionsContainer}>
                        <InfoBox>
                            <Text style={[styles.infoText, { color: body.color }]}>{t('emptyHistory')}</Text>
                            <CtaButton
                                ctaColor={primary.color}
                                ctaBorderColor={primary.color}
                                secondaryCtaColor={primary.body}
                                text={t('refresh')}
                                onPress={() => this.props.onRefresh()}
                                ctaWidth={width / 1.6}
                                ctaHeight={height / 12}
                                displayActivityIndicator={isRefreshing}
                            />
                        </InfoBox>
                    </View>
                }
            />
        );
    }

    render() {
        const {
            t,
            theme: { dark, body },
            setViewingMoonpayPurchases,
            isViewingMoonpayPurchases,
        } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <View style={styles.headerButtonsContainer}>
                        <TouchableOpacity onPress={() => setViewingMoonpayPurchases(false)}>
                            <View
                                style={[
                                    styles.leftHeaderButton,
                                    { backgroundColor: isViewingMoonpayPurchases ? dark.color : body.bg },
                                ]}
                            >
                                <Text style={[styles.buttonText, { color: body.color }]}>{t('transactions')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setViewingMoonpayPurchases(true)}>
                            <View
                                style={[
                                    styles.rightHeaderButton,
                                    { backgroundColor: isViewingMoonpayPurchases ? body.bg : dark.color },
                                ]}
                            >
                                <Text style={[styles.buttonText, { color: dark.body }]}>{t('purchases')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.listContainer}>
                        <View style={styles.list}>
                            {isViewingMoonpayPurchases ? this.renderMoonPayPurchases() : this.renderIOTATransactions()}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    transactions: getTransactionsForSelectedAccount(state),
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    addresses: getAddressesForSelectedAccount(state),
    mode: state.settings.mode,
    theme: getThemeFromState(state),
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isSyncing: state.ui.isSyncing,
    isTransitioning: state.ui.isTransitioning,
    isPromotingTransaction: state.ui.isPromotingTransaction,
    isAutoPromoting: state.polling.isAutoPromoting,
    currentlyPromotingBundleHash: state.ui.currentlyPromotingBundleHash,
    isRetryingFailedTransaction: state.ui.isRetryingFailedTransaction,
    modalProps: state.ui.modalProps,
    isModalActive: state.ui.isModalActive,
    modalContent: state.ui.modalContent,
    password: state.wallet.password,
    moonpayPurchases: getAllTransactions(state),
    isViewingMoonpayPurchases: state.ui.isViewingMoonpayPurchases,
    isAuthenticatedForMoonPay: state.exchanges.moonpay.isAuthenticated,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
});

const mapDispatchToProps = {
    generateAlert,
    promoteTransaction,
    toggleModalActivity,
    retryFailedTransaction,
    updateModalProps,
    setViewingMoonpayPurchases,
    updateMoonPayTransactionDetails,
};

export default WithManualRefresh()(
    withTranslation(['history', 'global'])(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(History),
    ),
);
