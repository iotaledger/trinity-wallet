import map from 'lodash/map';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableWithoutFeedback, RefreshControl, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { extractTailTransferFromBundle } from 'iota-wallet-shared-modules/libs/transfers';
import {
    getAddressesForSelectedAccountViaSeedIndex,
    getDeduplicatedTransfersForSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { convertFromTrytes, isReceivedTransfer, iota } from 'iota-wallet-shared-modules/libs/iota';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
import TransactionRow from '../components/transactionRow';
import { width, height } from '../util/dimensions';
import keychain, { getSeed } from '../util/keychain';

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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noTransactions: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
});

class History extends Component {
    static propTypes = {
        addresses: PropTypes.array.isRequired,
        transfers: PropTypes.array.isRequired,
        closeTopBar: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        positiveColor: PropTypes.string.isRequired,
        extraColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        pendingColor: PropTypes.string.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        isFetchingLatestAccountInfoOnLogin: PropTypes.bool.isRequired,
        generateAlert: PropTypes.func.isRequired,
        seedIndex: PropTypes.number.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = { refreshing: false, isModalVisible: false };
        this.onRefresh = this.onRefresh.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.isFetchingLatestAccountInfoOnLogin && !newProps.isFetchingLatestAccountInfoOnLogin) {
            this.setState({ refreshing: false });
        }
    }

    onRefresh() {
        if (!this.shouldPreventManualRefresh()) {
            this.setState({ refreshing: true });
            this.updateAccountData();
        }
    }

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
        const { selectedAccountName, seedIndex } = this.props;
        keychain
            .get()
            .then((credentials) => {
                const seed = getSeed(credentials.data, seedIndex);
                this.props.getAccountInfo(seed, selectedAccountName);
            })
            .catch((err) => console.log(err));
    }

    prepTransactions() {
        const {
            transfers,
            addresses,
            extraColor,
            negativeColor,
            positiveColor,
            pendingColor,
            secondaryBackgroundColor,
            backgroundColor,
            t,
        } = this.props;

        const computeConfirmationStatus = (persistence, incoming) => {
            if (!persistence) {
                return t('global:pending');
            }

            return incoming ? t('global:received') : t('global:sent');
        };

        const isSecondaryBackgroundColorWhite = secondaryBackgroundColor === 'white';

        const containerBorderColor = isSecondaryBackgroundColorWhite
            ? 'rgba(255, 255, 255, 0.25)'
            : 'rgba(0, 0, 0, 0.25)';
        const containerBackgroundColor = isSecondaryBackgroundColorWhite ? 'rgba(255, 255, 255, 0.08)' : 'transparent';

        const withValueAndUnit = (item) => ({
            address: iota.utils.addChecksum(item.address, 9, true),
            value: round(formatValue(item.value), 1),
            unit: formatUnit(item.value),
        });

        return map(transfers, (transfer) => {
            const tx = extractTailTransferFromBundle(transfer);
            const incoming = isReceivedTransfer(transfer, addresses);

            return {
                t,
                generateAlert: this.props.generateAlert, // Already declated in upper scope
                addresses: map(transfer, withValueAndUnit),
                status: incoming ? t('history:receive') : t('history:send'),
                confirmation: computeConfirmationStatus(tx.persistence, incoming),
                value: round(formatValue(tx.value), 1),
                unit: formatUnit(tx.value),
                time: tx.timestamp,
                message: convertFromTrytes(tx.signatureMessageFragment),
                bundle: tx.bundle,
                style: {
                    titleColor: incoming ? extraColor : negativeColor,
                    containerBorderColor: { borderColor: containerBorderColor },
                    containerBackgroundColor: { backgroundColor: containerBackgroundColor },
                    confirmationStatusColor: { color: !tx.persistence ? pendingColor : positiveColor },
                    defaultTextColor: { color: secondaryBackgroundColor },
                    backgroundColor,
                    borderColor: { borderColor: secondaryBackgroundColor },
                },
            };
        });
    }

    renderTransactions() {
        const { negativeColor, secondaryBackgroundColor, t } = this.props;
        const { refreshing } = this.state;

        const data = this.prepTransactions();

        return (
            <FlatList
                data={data}
                initialNumToRender={8} // TODO: Should be dynamically computed.
                removeClippedSubviews
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => <TransactionRow {...item} />}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={this.onRefresh} tintColor={negativeColor} />
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => (
                    <View style={styles.noTransactionsContainer}>
                        <Text style={[styles.noTransactions, { color: secondaryBackgroundColor }]}>
                            {t('global:noTransactions')}
                        </Text>
                    </View>
                )}
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

const mapStateToProps = ({ tempAccount, account, settings, polling }) => ({
    addresses: getAddressesForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    transfers: getDeduplicatedTransfersForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(tempAccount.seedIndex, account.seedNames),
    seedIndex: tempAccount.seedIndex,
    negativeColor: settings.theme.negativeColor,
    positiveColor: settings.theme.positiveColor,
    backgroundColor: settings.theme.backgroundColor,
    extraColor: settings.theme.extraColor,
    secondaryBackgroundColor: settings.theme.secondaryBackgroundColor,
    pendingColor: settings.theme.pendingColor,
    isFetchingLatestAccountInfoOnLogin: tempAccount.isFetchingLatestAccountInfoOnLogin,
    isFetchingAccountInfo: polling.isFetchingAccountInfo,
    isGeneratingReceiveAddress: tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: tempAccount.isSendingTransfer,
    isSyncing: tempAccount.isSyncing,
    isTransitioning: tempAccount.isTransitioning,
});

const mapDispatchToProps = {
    generateAlert,
    getAccountInfo,
};

export default translate(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History));
