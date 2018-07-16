import assign from 'lodash/assign';
import map from 'lodash/map';
import clone from 'lodash/clone';
import cloneDeep from 'lodash/cloneDeep';
import has from 'lodash/has';
import includes from 'lodash/includes';
import get from 'lodash/get';
import orderBy from 'lodash/orderBy';
import React, { Component } from 'react';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback, RefreshControl, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { promoteTransaction, retryFailedTransaction } from 'iota-wallet-shared-modules/actions/transfers';
import {
    getTransfersForSelectedAccount,
    getSelectedAccountName,
    getAddressesForSelectedAccount,
    getFailedBundleHashesForSelectedAccount,
} from 'iota-wallet-shared-modules/selectors/accounts';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { round } from 'iota-wallet-shared-modules/libs/utils';
import { toggleModalActivity } from 'iota-wallet-shared-modules/actions/ui';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import WithManualRefresh from '../components/ManualRefresh';
import TransactionRow from '../components/TransactionRow';
import HistoryModalContent from '../components/HistoryModalContent';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import { getPowFn } from '../utils/nativeModules';
import CtaButton from '../components/CtaButton';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: isAndroid ? 0 : height / 80,
    },
    listView: {
        height: height * 0.7,
        justifyContent: 'flex-end',
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
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

/** History screen component */
class History extends Component {
    static propTypes = {
        /** Transactions for selected account */
        transfers: PropTypes.object.isRequired,
        /** Close active top bar */
        closeTopBar: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Promotes bundle
         * @param {string} bundle - bundle hash
         */
        promoteTransaction: PropTypes.func.isRequired,
        /** Determines if wallet is manually syncing account information */
        isSyncing: PropTypes.bool.isRequired,
        /** Determines if wallet is making a transaction */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Determines if wallet is generating receive address */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** Determines if wallet is doing snapshot transition */
        isTransitioning: PropTypes.bool.isRequired,
        /** Determines if wallet is manually promoting transaction */
        isPromotingTransaction: PropTypes.bool.isRequired,
        /** Currently selected mode for wallet */
        mode: PropTypes.string.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
        /** Determines if wallet is autopromoting transaction */
        isAutoPromoting: PropTypes.bool.isRequired,
        /** Bundle hash for the transaction that is currently being promoted */
        currentlyPromotingBundleHash: PropTypes.string.isRequired,
        /** Determines whether account is being manually refreshed */
        isRefreshing: PropTypes.bool.isRequired,
        /** Fetches latest account info on swipe down */
        onRefresh: PropTypes.func.isRequired,
        /** Addresses for selected account */
        addresses: PropTypes.array.isRequired,
        /** Failed transactions bundle hashes for selected account */
        failedBundleHashes: PropTypes.object.isRequired,
        /** Make a retry attempt for a failed transaction
         * @param {string} accountName
         * @param {string} bundleHash
         * @param {function} powFn
         */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** Determines if a failed transaction is being retried */
        isRetryingFailedTransaction: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        this.state = {
            modalProps: null,
        };
        this.resetModalProps = this.resetModalProps.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('History');
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

    /**
     * Formats transaction list to accommodate for sending to self
     * @param {Array} transactions
     * @return {Array} Formatted transaction list
     */
    formatRelevantTransactions(transactions) {
        const { addresses } = this.props;
        const relevantTransactions = [];
        map(transactions, (transaction) => {
            if (
                (transaction.transferValue !== 0 &&
                    !transaction.incoming &&
                    transaction.outputs.every((tx) => addresses.includes(tx.address))) ||
                (transaction.transferValue === 0 && transaction.outputs.every((tx) => addresses.includes(tx.address)))
            ) {
                const sendToSelfTransaction = clone(transaction);
                sendToSelfTransaction.incoming = true;
                relevantTransactions.push(sendToSelfTransaction);
                relevantTransactions.push(transaction);
            } else {
                relevantTransactions.push(transaction);
            }
        });
        return relevantTransactions;
    }

    /**
     * Formats transaction data
     * @return {Array} Formatted transaction data
     */
    prepTransactions() {
        const {
            transfers,
            theme: { primary, secondary, body, bar, dark },
            mode,
            t,
            selectedAccountName,
            currentlyPromotingBundleHash,
            isRefreshing,
            addresses,
        } = this.props;
        const relevantTransfers = this.formatRelevantTransactions(cloneDeep(transfers));

        const computeStatusText = (outputs, persistence, incoming, value) => {
            const receiveStatus = persistence ? t('received') : t('receiving');
            const sendStatus = persistence ? t('sent') : t('sending');
            if (value === 0) {
                if (
                    !includes(addresses, get(outputs, '[0].address')) &&
                    includes(addresses, get(outputs, '[1].address'))
                ) {
                    return sendStatus;
                }
                return receiveStatus;
            }

            return incoming ? receiveStatus : sendStatus;
        };

        const computeIncoming = (outputs, incoming, value) => {
            if (value === 0) {
                if (
                    !includes(addresses, get(outputs, '[0].address')) &&
                    includes(addresses, get(outputs, '[1].address'))
                ) {
                    return false;
                }
                return true;
            }

            return incoming ? true : false;
        };

        const withUnitAndChecksum = (item) => ({
            address: `${item.address}${item.checksum}`,
            value: round(formatValue(item.value), 1),
            unit: formatUnit(item.value),
        });

        const proofOfWorkFunction = getPowFn();
        const formattedTransfers = map(relevantTransfers, (transfer) => {
            const { timestamp, incoming, persistence, transferValue, inputs, outputs, bundle, message } = transfer;
            const value = round(formatValue(transferValue), 1);
            return {
                t,
                status: computeStatusText(outputs, persistence, incoming, value),
                confirmationBool: persistence,
                persistence,
                value,
                fullValue: formatValue(transferValue),
                unit: formatUnit(transferValue),
                time: timestamp,
                message,
                mode,
                incoming: computeIncoming(outputs, incoming, value),
                addresses,
                icon: computeIncoming(outputs, incoming, value) ? 'plus' : 'minus',
                bundleIsBeingPromoted: currentlyPromotingBundleHash === bundle && !persistence,
                outputs,
                onPress: (modalProps) => {
                    if (isRefreshing) {
                        return;
                    }

                    this.setState({
                        modalProps: assign({}, modalProps, {
                            retryFailedTransaction: (bundle) =>
                                this.props.retryFailedTransaction(selectedAccountName, bundle, proofOfWorkFunction),
                            promote: (bundle) =>
                                this.props.promoteTransaction(bundle, selectedAccountName, proofOfWorkFunction),
                            onPress: this.props.toggleModalActivity,
                            generateAlert: this.props.generateAlert,
                            bundle,
                            addresses: [...map(inputs, withUnitAndChecksum), ...map(outputs, withUnitAndChecksum)],
                        }),
                    });

                    this.props.toggleModalActivity();
                },
                style: {
                    titleColor: persistence
                        ? computeIncoming(outputs, incoming, value) ? primary.color : secondary.color
                        : '#fc6e6d',
                    pendingColor: '#fc6e6d',
                    containerBackgroundColor: { backgroundColor: dark.color },
                    defaultTextColor: { color: body.color },
                    rowTextColor: { color: dark.body },
                    rowBorderColor: { borderColor: primary.border },
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

    resetModalProps() {
        this.setState({ modalProps: null });
        this.props.toggleModalActivity();
    }

    renderTransactions() {
        const { theme: { primary }, t, isRefreshing } = this.props;
        const data = this.prepTransactions();
        const noTransactions = data.length === 0;

        return (
            <OptimizedFlatList
                contentContainerStyle={noTransactions ? styles.flatList : null}
                data={data}
                initialNumToRender={8} // TODO: Should be dynamically computed.
                removeClippedSubviews
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => <TransactionRow {...item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing && !noTransactions}
                        onRefresh={this.props.onRefresh}
                        tintColor={primary.color}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.noTransactionsContainer}>
                        {!isRefreshing ? (
                            <View style={styles.refreshButtonContainer}>
                                <CtaButton
                                    ctaColor={primary.color}
                                    secondaryCtaColor={primary.body}
                                    text={t('global:refresh')}
                                    onPress={this.props.onRefresh}
                                    ctaWidth={width / 2}
                                    ctaHeight={height / 16}
                                />
                            </View>
                        ) : (
                            <View style={styles.refreshButtonContainer}>
                                <ActivityIndicator
                                    animating={isRefreshing}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={primary.color}
                                />
                            </View>
                        )}
                    </View>
                }
            />
        );
    }

    render() {
        const transactions = this.renderTransactions();
        const {
            theme,
            isModalActive,
            isAutoPromoting,
            isPromotingTransaction,
            currentlyPromotingBundleHash,
            isRetryingFailedTransaction,
            failedBundleHashes,
        } = this.props;
        const { modalProps } = this.state;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <View style={{ flex: 0.2 }} />
                    <View style={styles.listView}>{transactions}</View>
                    {modalProps && (
                        <Modal
                            animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                            animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                            animationInTiming={isAndroid ? 1000 : 300}
                            animationOutTiming={200}
                            backdropTransitionInTiming={isAndroid ? 500 : 300}
                            backdropTransitionOutTiming={200}
                            backdropColor={theme.body.bg}
                            backdropOpacity={0.6}
                            style={styles.modal}
                            isVisible={isModalActive}
                            onBackButtonPress={this.resetModalProps}
                            hideModalContentWhileAnimating
                            useNativeDriver={isAndroid}
                        >
                            <HistoryModalContent
                                {...modalProps}
                                disableWhen={isAutoPromoting || isPromotingTransaction || isRetryingFailedTransaction}
                                isRetryingFailedTransaction={isRetryingFailedTransaction}
                                currentlyPromotingBundleHash={currentlyPromotingBundleHash}
                                isFailedTransaction={(bundle) => has(failedBundleHashes, bundle)}
                            />
                        </Modal>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    transfers: getTransfersForSelectedAccount(state),
    selectedAccountName: getSelectedAccountName(state),
    addresses: getAddressesForSelectedAccount(state),
    mode: state.settings.mode,
    theme: state.settings.theme,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isSyncing: state.ui.isSyncing,
    isTransitioning: state.ui.isTransitioning,
    isPromotingTransaction: state.ui.isPromotingTransaction,
    isAutoPromoting: state.polling.isAutoPromoting,
    isModalActive: state.ui.isModalActive,
    currentlyPromotingBundleHash: state.ui.currentlyPromotingBundleHash,
    failedBundleHashes: getFailedBundleHashesForSelectedAccount(state),
    isRetryingFailedTransaction: state.ui.isRetryingFailedTransaction,
});

const mapDispatchToProps = {
    generateAlert,
    promoteTransaction,
    toggleModalActivity,
    retryFailedTransaction,
};

export default WithManualRefresh()(
    translate(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History)),
);
