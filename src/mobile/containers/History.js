import assign from 'lodash/assign';
import map from 'lodash/map';
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
import { broadcastBundle, promoteTransaction } from 'iota-wallet-shared-modules/actions/transfers';
import {
    getTransfersForSelectedAccount,
    getSelectedAccountName,
    getAddressesForSelectedAccount,
} from 'iota-wallet-shared-modules/selectors/accounts';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { round } from 'iota-wallet-shared-modules/libs/utils';
import { toggleModalActivity } from 'iota-wallet-shared-modules/actions/ui';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import tinycolor from 'tinycolor2';
import WithManualRefresh from '../components/ManualRefresh';
import TransactionRow from '../components/TransactionRow';
import HistoryModalContent from '../components/HistoryModalContent';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import CtaButton from '../components/CtaButton';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    listView: {
        height: height * 0.7,
        justifyContent: 'flex-end',
    },
    separator: {
        flex: 1,
        height: height / 60,
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
        /** Rebroadcast bundle
         * @param {string} bundle - bundle hash
         */
        broadcastBundle: PropTypes.func.isRequired,
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
        /** Determines if wallet is broadcasting bundle */
        isBroadcastingBundle: PropTypes.bool.isRequired,
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
        // FIXME: Temporary solution until local/remote PoW is reworked on auto-promotion. Will disable autopromotion UI feedback after first failure.
        hasFailedAutopromotion: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        this.state = {
            modalProps: null,
        };
        this.resetModalProps = this.resetModalProps.bind(this);
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
            theme: { negative, primary, secondary, positive, body, bar },
            mode,
            t,
            selectedAccountName,
            currentlyPromotingBundleHash,
            isRefreshing,
            addresses,
            hasFailedAutopromotion,
        } = this.props;
        const containerBorderColor = tinycolor(body.bg).isDark() ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
        const containerBackgroundColor = tinycolor(body.bg).isDark() ? 'rgba(255, 255, 255, 0.08)' : 'transparent';

        const computeConfirmation = (outputs, persistence, incoming, value) => {
            if (!persistence) {
                return t('global:pending');
            }

            if (value === 0) {
                if (
                    !includes(addresses, get(outputs, '[0].address')) &&
                    includes(addresses, get(outputs, '[1].address'))
                ) {
                    return t('global:sent');
                }
                return t('global:received');
            }

            return incoming ? t('global:received') : t('global:sent');
        };

        const computeStatus = (outputs, incoming, value) => {
            if (value === 0) {
                if (
                    !includes(addresses, get(outputs, '[0].address')) &&
                    includes(addresses, get(outputs, '[1].address'))
                ) {
                    return t('history:send');
                }
                return t('history:receive');
            }

            return incoming ? t('history:receive') : t('history:send');
        };

        const withUnitAndChecksum = (item) => ({
            address: `${item.address}${item.checksum}`,
            value: round(formatValue(item.value), 1),
            unit: formatUnit(item.value),
        });

        const formattedTransfers = map(transfers, (transfer) => {
            const { timestamp, incoming, persistence, transferValue, inputs, outputs, bundle, message } = transfer;
            const value = round(formatValue(transferValue), 1);
            return {
                t,
                status: computeStatus(outputs, incoming, value),
                confirmation: computeConfirmation(outputs, persistence, incoming, value),
                confirmationBool: persistence,
                value,
                unit: formatUnit(transferValue),
                time: timestamp,
                message,
                mode,
                bundleIsBeingPromoted:
                    currentlyPromotingBundleHash === bundle && !persistence && !hasFailedAutopromotion,
                onPress: (modalProps) => {
                    if (isRefreshing) {
                        return;
                    }
                    this.setState({
                        modalProps: assign({}, modalProps, {
                            rebroadcast: (bundle) => this.props.broadcastBundle(bundle, selectedAccountName),
                            promote: (bundle) => {
                                // FIXME: Temporary solution until local/remote PoW is reworked on auto-promotion. Will display alert after first autopromote failure.
                                if (hasFailedAutopromotion) {
                                    return this.props.generateAlert(
                                        'error',
                                        t('global:attachToTangleUnavailable'),
                                        t('global:attachToTangleUnavailableExplanationShort'),
                                        10000,
                                    );
                                }
                                this.props.promoteTransaction(bundle, selectedAccountName);
                            },
                            onPress: this.props.toggleModalActivity,
                            generateAlert: this.props.generateAlert,
                            bundle,
                            addresses: [...map(inputs, withUnitAndChecksum), ...map(outputs, withUnitAndChecksum)],
                            hasFailedAutopromotion,
                        }),
                    });

                    this.props.toggleModalActivity();
                },
                style: {
                    titleColor: incoming ? primary.color : secondary.color,
                    containerBorderColor: { borderColor: containerBorderColor },
                    containerBackgroundColor: { backgroundColor: containerBackgroundColor },
                    confirmationStatusColor: { color: !persistence ? negative.color : positive.color },
                    defaultTextColor: { color: body.color },
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
            isBroadcastingBundle,
            currentlyPromotingBundleHash,
            hasFailedAutopromotion,
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
                                disableWhen={
                                    (isAutoPromoting || isPromotingTransaction || isBroadcastingBundle) &&
                                    !hasFailedAutopromotion
                                }
                                isBroadcastingBundle={isBroadcastingBundle}
                                currentlyPromotingBundleHash={currentlyPromotingBundleHash}
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
    isBroadcastingBundle: state.ui.isBroadcastingBundle,
    isPromotingTransaction: state.ui.isPromotingTransaction,
    isAutoPromoting: state.polling.isAutoPromoting,
    isModalActive: state.ui.isModalActive,
    currentlyPromotingBundleHash: state.ui.currentlyPromotingBundleHash,
    hasFailedAutopromotion: state.ui.hasFailedAutopromotion,
});

const mapDispatchToProps = {
    generateAlert,
    broadcastBundle,
    promoteTransaction,
    toggleModalActivity,
};

export default WithManualRefresh()(
    translate(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History)),
);
