import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ListView, Text, TouchableWithoutFeedback, Clipboard, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import {
    getAddressesForSelectedAccountViaSeedIndex,
    getDeduplicatedTransfersForSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import TransactionRow from '../components/transactionRow';
import { width, height } from '../util/dimensions';
import keychain, { getSeed } from '../util/keychain';
import THEMES from '../theme/themes';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class History extends Component {
    static propTypes = {
        addresses: PropTypes.array.isRequired,
        transfers: PropTypes.array.isRequired,
        closeTopBar: PropTypes.func.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        positiveColor: PropTypes.object.isRequired,
        extraColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        pendingColor: PropTypes.string.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        isFetchingLatestAccountInfoOnLogin: PropTypes.bool.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = { viewRef: null, refreshing: false };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.isFetchingLatestAccountInfoOnLogin && !newProps.isFetchingLatestAccountInfoOnLogin) {
            this.setState({ refreshing: false });
        }
    }

    shouldPreventManualRefresh() {
        const props = this.props;

        const isAlreadyDoingSomeHeavyLifting =
            props.isSyncing || props.isSendingTransfer || props.isGeneratingReceiveAddress;

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

    _onRefresh() {
        if (!this.shouldPreventManualRefresh()) {
            this.setState({ refreshing: true });
            this.updateAccountData();
        }
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

    // FIXME: findNodeHangle is not defined
    imageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    copyBundleHash(item) {
        const { t, generateAlert } = this.props;
        Clipboard.setString(item);
        generateAlert('success', t('bundleHashCopied'), t('bundleHashCopiedExplanation'));
    }

    copyAddress(item) {
        const { t, generateAlert } = this.props;
        Clipboard.setString(item);
        generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    render() {
        const {
            t,
            addresses,
            transfers,
            positiveColor,
            negativeColor,
            backgroundColor,
            extraColor,
            secondaryBackgroundColor,
            pendingColor,
        } = this.props;
        const hasTransactions = transfers.length > 0;
        const textColor = { color: secondaryBackgroundColor };
        const borderColor = { borderColor: secondaryBackgroundColor };
        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    {hasTransactions ? (
                        <View style={styles.listView}>
                            <ListView
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this._onRefresh.bind(this)}
                                        tintColor={THEMES.getHSL(negativeColor)}
                                    />
                                }
                                contentContainerStyle={{ paddingTop: 1, paddingBottom: 1 }}
                                dataSource={ds.cloneWithRows(transfers)}
                                renderRow={(dataSource) => (
                                    <TransactionRow
                                        addresses={addresses}
                                        rowData={dataSource}
                                        titleColor="#F8FFA6"
                                        copyAddress={(item) => this.copyAddress(item)}
                                        copyBundleHash={(item) => this.copyBundleHash(item)}
                                        positiveColor={THEMES.getHSL(positiveColor)}
                                        negativeColor={THEMES.getHSL(negativeColor)}
                                        extraColor={THEMES.getHSL(extraColor)}
                                        backgroundColor={THEMES.getHSL(backgroundColor)}
                                        textColor={textColor}
                                        borderColor={borderColor}
                                        secondaryBackgroundColor={secondaryBackgroundColor}
                                        pendingColor={pendingColor}
                                    />
                                )}
                                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                                enableEmptySections
                                ref={(listview) => {
                                    this.listview = listview;
                                }}
                                onLoadEnd={this.imageLoaded.bind(this)}
                                snapToInterval={height * 0.7 / 6}
                            />
                        </View>
                    ) : (
                        <View style={styles.noTransactionsContainer}>
                            <Text style={[styles.noTransactions, textColor]}>{t('global:noTransactions')}</Text>
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

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
});

const mapDispatchToProps = {
    generateAlert,
    getAccountInfo,
};

export default translate(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History));
