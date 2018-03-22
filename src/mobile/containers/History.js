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
} from 'iota-wallet-shared-modules/selectors/account';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { convertFromTrytes } from 'iota-wallet-shared-modules/libs/iota/utils';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
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

class History extends Component {
    static propTypes = {
        addresses: PropTypes.array.isRequired,
        transfers: PropTypes.array.isRequired,
        closeTopBar: PropTypes.func.isRequired,
        primary: PropTypes.object.isRequired,
        secondary: PropTypes.object.isRequired,
        extra: PropTypes.object.isRequired,
        negative: PropTypes.object.isRequired,
        positive: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        bar: PropTypes.object.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        isFetchingLatestAccountInfoOnLogin: PropTypes.bool.isRequired,
        isFetchingAccountInfo: PropTypes.bool.isRequired,
        generateAlert: PropTypes.func.isRequired,
        seedIndex: PropTypes.number.isRequired,
        t: PropTypes.func.isRequired,
        broadcastBundle: PropTypes.func.isRequired,
        promoteTransaction: PropTypes.func.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isTransitioning: PropTypes.bool.isRequired,
        isBroadcastingBundle: PropTypes.bool.isRequired,
        isPromotingTransaction: PropTypes.bool.isRequired,
        mode: PropTypes.string.isRequired,
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
            negative,
            primary,
            secondary,
            positive,
            body,
            bar,
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
        const { primary, t } = this.props;
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

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
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
    seedIndex: state.tempAccount.seedIndex,
    mode: state.settings.mode,
    negative: state.settings.theme.negative,
    primary: state.settings.theme.primary,
    secondary: state.settings.theme.secondary,
    positive: state.settings.theme.positive,
    extra: state.settings.theme.extra,
    body: state.settings.theme.body,
    bar: state.settings.theme.bar,
    isFetchingLatestAccountInfoOnLogin: state.tempAccount.isFetchingLatestAccountInfoOnLogin,
    isFetchingAccountInfo: state.polling.isFetchingAccountInfo,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isSyncing: state.tempAccount.isSyncing,
    isTransitioning: state.tempAccount.isTransitioning,
    isBroadcastingBundle: state.ui.isBroadcastingBundle,
    isPromotingTransaction: state.ui.isPromotingTransaction,
    password: state.tempAccount.password,
});

const mapDispatchToProps = {
    generateAlert,
    getAccountInfo,
    broadcastBundle,
    promoteTransaction,
};

export default translate(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History));
