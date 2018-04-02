import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback, RefreshControl, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { broadcastBundle, promoteTransaction } from 'iota-wallet-shared-modules/actions/transfers';
import {
    getRelevantTransfer,
    isReceivedTransfer,
    getTransferValue,
} from 'iota-wallet-shared-modules/libs/iota/transfers';
import {
    getAddressesForSelectedAccount,
    getDeduplicatedTransfersForSelectedAccount,
    getSelectedAccountName,
} from 'iota-wallet-shared-modules/selectors/accounts';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/accounts';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { round } from 'iota-wallet-shared-modules/libs/utils';
import { convertFromTrytes, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import tinycolor from 'tinycolor2';
import TransactionRow from '../components/TransactionRow';
import { width, height } from '../utils/dimensions';
import { getSeedFromKeychain } from '../utils/keychain';
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
});

/** History screen component */
class History extends Component {
    static propTypes = {
        /** Addresses for selected account */
        addresses: PropTypes.array.isRequired,
        /** Transactions for selected account */
        transfers: PropTypes.array.isRequired,
        /** Close active top bar */
        closeTopBar: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Fetch latest account information
        * @param {string} seed - seed value
        * @param {string} selectedAccountName 
        */
        getAccountInfo: PropTypes.func.isRequired,
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Determines if there is already a network call going on for fetching latest acocunt info */
        isFetchingLatestAccountInfoOnLogin: PropTypes.bool.isRequired,
        /** Determines if background poll is already fetching latest acocunt info */
        isFetchingAccountInfo: PropTypes.bool.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Index of currently selected account in accountNames list */
        seedIndex: PropTypes.number.isRequired,
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
        /** Determines if wallet is promoting transaction */
        isPromotingTransaction: PropTypes.bool.isRequired,
        /** Currently selected mode for wallet */
        mode: PropTypes.string.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = { isRefreshing: false };
        this.onRefresh = this.onRefresh.bind(this);
    }

    componentWillReceiveProps(newProps) {
        const { seedIndex } = this.props;
        if (this.props.isFetchingLatestAccountInfoOnLogin && !newProps.isFetchingLatestAccountInfoOnLogin) {
            this.setState({ isRefreshing: false });
        }
        if (seedIndex !== newProps.seedIndex) {
            this.setState({ isRefreshing: false });
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

    /**
     * Triggers a refresh
     */
    onRefresh() {
        const { isRefreshing } = this.state;

        if (isRefreshing) {
            return;
        }

        if (!this.shouldPreventManualRefresh()) {
            this.setState({ isRefreshing: true });
            this.updateAccountData();
        }
    }

    /**
     * Prevents more than one refresh from occurring at the same time
     */
    shouldPreventManualRefresh() {
        const props = this.props;

        const isAlreadyDoingSomeHeavyLifting =
            props.isSyncing || props.isSendingTransfer || props.isGeneratingReceiveAddress || props.isTransitioning;

        const isAlreadyFetchingAccountInfo = props.isFetchingAccountInfo;

        if (isAlreadyFetchingAccountInfo) {
            this.generateAlreadyFetchingAccountInfoAlert();
        }

        return isAlreadyDoingSomeHeavyLifting || isAlreadyFetchingAccountInfo;
    }

    generateAlreadyFetchingAccountInfoAlert() {
        this.props.generateAlert(
            'error',
            'Already fetching transaction history',
            'Your transaction history will be updated automatically.',
        );
    }

    updateAccountData() {
        const { t, selectedAccountName, password } = this.props;
        getSeedFromKeychain(password, selectedAccountName)
            .then((seed) => {
                if (seed === null) {
                    return this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongTryAgain'),
                    );
                }
                this.props.getAccountInfo(seed, selectedAccountName);
            })
            .catch((err) => console.log(err));
    }

    /**
     * Formats transaction data
     * @return {Array} Formatted transaction data
     */
    prepTransactions() {
        const {
            transfers,
            addresses,
            theme: {
                negative,
                primary,
                secondary,
                positive,
                body,
                bar
            },
            mode,
            t,
            selectedAccountName,
            isBroadcastingBundle,
            isPromotingTransaction,
        } = this.props;
        const containerBorderColor = tinycolor(body.bg).isDark() ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
        const containerBackgroundColor = tinycolor(body.bg).isDark() ? 'rgba(255, 255, 255, 0.08)' : 'transparent';

        const computeConfirmationStatus = (persistence, incoming) => {
            if (!persistence) {
                return t('global:pending');
            }

            return incoming ? t('global:received') : t('global:sent');
        };

        const withValueAndUnit = (item) => ({
            address: item.address,
            value: round(formatValue(item.value), 1),
            unit: formatUnit(item.value),
        });

        const formattedTransfers = map(transfers, (transfer) => {
            const tx = getRelevantTransfer(transfer, addresses);
            const value = getTransferValue(transfer, addresses);
            const incoming = isReceivedTransfer(transfer, addresses);
            const disableWhen = isBroadcastingBundle || isPromotingTransaction;

            return {
                t,
                disableWhen,
                rebroadcast: (bundle) => this.props.broadcastBundle(bundle, selectedAccountName),
                promote: (bundle) => this.props.promoteTransaction(bundle, selectedAccountName),
                generateAlert: this.props.generateAlert, // Already declated in upper scope
                addresses: map(transfer, withValueAndUnit),
                status: incoming ? t('history:receive') : t('history:send'),
                confirmation: computeConfirmationStatus(tx.persistence, incoming),
                confirmationBool: tx.persistence,
                value: round(formatValue(value), 1),
                unit: formatUnit(value),
                time: tx.timestamp,
                message: convertFromTrytes(tx.signatureMessageFragment),
                bundle: tx.bundle,
                mode,
                style: {
                    titleColor: incoming ? primary.color : secondary.color,
                    containerBorderColor: { borderColor: containerBorderColor },
                    containerBackgroundColor: { backgroundColor: containerBackgroundColor },
                    confirmationStatusColor: { color: !tx.persistence ? negative.color : positive.color },
                    defaultTextColor: { color: body.color },
                    backgroundColor: body.bg,
                    borderColor: { borderColor: body.color },
                    barBg: bar.bg,
                    primaryColor: primary.color,
                    primaryBody: primary.body,
                    secondaryColor: secondary.color,
                    secondaryBody: secondary.body,
                    barColor: bar.color,
                    buttonsOpacity: { opacity: disableWhen ? 0.5 : 1 },
                },
            };
        });

        return orderBy(formattedTransfers, 'time', ['desc']);
    }

    renderTransactions() {
        const { theme: { primary }, t } = this.props;
        const { isRefreshing } = this.state;
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
                        onRefresh={this.onRefresh}
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
                                    onPress={this.onRefresh}
                                    ctaWidth={width / 2}
                                    ctaHeight={height / 16}
                                />
                            </View>
                        ) : (<View style={styles.refreshButtonContainer}>
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

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <View style={{ flex: 0.2 }} />
                    <View style={styles.listView}>{transactions}</View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    addresses: getAddressesForSelectedAccount(state),
    transfers: getDeduplicatedTransfersForSelectedAccount(state),
    selectedAccountName: getSelectedAccountName(state),
    seedIndex: state.wallet.seedIndex,
    mode: state.settings.mode,
    theme: state.settings.theme,
    isFetchingLatestAccountInfoOnLogin: state.ui.isFetchingLatestAccountInfoOnLogin,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isSyncing: state.ui.isSyncing,
    isTransitioning: state.ui.isTransitioning,
    isBroadcastingBundle: state.ui.isBroadcastingBundle,
    isPromotingTransaction: state.ui.isPromotingTransaction,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    generateAlert,
    getAccountInfo,
    broadcastBundle,
    promoteTransaction,
};

export default translate(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History));
