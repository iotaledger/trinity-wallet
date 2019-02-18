import merge from 'lodash/merge';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback, RefreshControl, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { generateAlert } from 'shared-modules/actions/alerts';
import { computeStatusText, formatRelevantTransactions } from 'shared-modules/libs/iota/transfers';
import { promoteTransaction, retryFailedTransaction } from 'shared-modules/actions/transfers';
import {
    getTransactionsForSelectedAccount,
    getSelectedAccountName,
    getSelectedAccountMeta,
    getAddressesForSelectedAccount,
} from 'shared-modules/selectors/accounts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SeedStore from 'libs/SeedStore';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { round } from 'shared-modules/libs/utils';
import { toggleModalActivity, updateModalProps } from 'shared-modules/actions/ui';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import WithManualRefresh from 'ui/components/ManualRefresh';
import TransactionRow from 'ui/components/TransactionRow';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import CtaButton from 'ui/components/CtaButton';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
    prepTransactions() {
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
                keyExtractor={(item, index) => index.toString()}
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
        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <View style={{ flex: 0.2 }} />
                    <View style={styles.listView}>{this.renderTransactions()}</View>
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
});

const mapDispatchToProps = {
    generateAlert,
    promoteTransaction,
    toggleModalActivity,
    retryFailedTransaction,
    updateModalProps,
};

export default WithManualRefresh()(
    withNamespaces(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History)),
);
