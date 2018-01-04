import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ListView, Text, TouchableWithoutFeedback, Clipboard } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import {
    getAddressesForSelectedAccountViaSeedIndex,
    getDeduplicatedTransfersForSelectedAccountViaSeedIndex,
} from '../../shared/selectors/account';
import TransactionRow from '../components/transactionRow';
import { width, height } from '../util/dimensions';
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
    };

    constructor() {
        super();

        this.state = { viewRef: null };
    }

    // FIXME: findNodeHangle is not defined
    imageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    copyBundleHash(item) {
        const { t } = this.props;
        Clipboard.setString(item);
        generateAlert('success', t('bundleHashCopied'), t('bundleHashCopiedExplanation'));
    }

    copyAddress(item) {
        const { t } = this.props;
        Clipboard.setString(item);
        generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    render() {
        const { t, addresses, transfers, positiveColor, negativeColor, backgroundColor, extraColor } = this.props;
        const hasTransactions = transfers.length > 0;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    {hasTransactions ? (
                        <View style={styles.listView}>
                            <ListView
                                dataSource={ds.cloneWithRows(transfers)}
                                renderRow={dataSource => (
                                    <TransactionRow
                                        addresses={addresses}
                                        rowData={dataSource}
                                        titleColor="#F8FFA6"
                                        onPress={event => this._showModal()}
                                        copyAddress={item => this.copyAddress(item)}
                                        copyBundleHash={item => this.copyBundleHash(item)}
                                        positiveColor={THEMES.getHSL(positiveColor)}
                                        negativeColor={THEMES.getHSL(negativeColor)}
                                        extraColor={THEMES.getHSL(extraColor)}
                                        backgroundColor={THEMES.getHSL(backgroundColor)}
                                    />
                                )}
                                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                                enableEmptySections
                                ref={listview => {
                                    this.listview = listview;
                                }}
                                onLoadEnd={this.imageLoaded.bind(this)}
                                snapToInterval={height * 0.7 / 6}
                            />
                        </View>
                    ) : (
                        <View style={styles.noTransactionsContainer}>
                            <Text style={styles.noTransactions}>{t('global:noTransactions')}</Text>
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
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
});

const mapStateToProps = ({ tempAccount, account, settings }) => ({
    addresses: getAddressesForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    transfers: getDeduplicatedTransfersForSelectedAccountViaSeedIndex(tempAccount.seedIndex, account.accountInfo),
    negativeColor: settings.theme.negativeColor,
    positiveColor: settings.theme.positiveColor,
    backgroundColor: settings.theme.backgroundColor,
    extraColor: settings.theme.extraColor,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['history', 'global'])(connect(mapStateToProps, mapDispatchToProps)(History));
