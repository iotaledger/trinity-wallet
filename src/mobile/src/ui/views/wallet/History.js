import assign from 'lodash/assign';
import map from 'lodash/map';
import has from 'lodash/has';
import orderBy from 'lodash/orderBy';
import React, { Component } from 'react';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback, RefreshControl, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from 'shared-modules/actions/alerts';
import { computeStatusText, formatRelevantTransactions } from 'shared-modules/libs/iota/transfers';
import { promoteTransaction, retryFailedTransaction } from 'shared-modules/actions/transfers';
import {
    getTransfersForSelectedAccount,
    getSelectedAccountName,
    getAddressesForSelectedAccount,
    getFailedBundleHashesForSelectedAccount,
} from 'shared-modules/selectors/accounts';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { round } from 'shared-modules/libs/utils';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import WithManualRefresh from 'ui/components/ManualRefresh';
import TransactionRow from 'ui/components/TransactionRow';
import HistoryModalContent from 'ui/components/HistoryModalContent';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import { getPowFn } from 'libs/nativeModules';
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
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
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
        isModalActive: PropTypes.bool.isRequired,
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
        /** Failed transactions bundle hashes for selected account */
        failedBundleHashes: PropTypes.object.isRequired,
        /** @ignore */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** @ignore */
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
        const relevantTransfers = formatRelevantTransactions(transfers, addresses);

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
                status: computeStatusText(outputs, persistence, incoming),
                confirmationBool: persistence,
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

    /**
     * Reset modal props from internal state
     */
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
