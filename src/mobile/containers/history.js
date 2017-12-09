import React from 'react';
import { TouchableOpacity, StyleSheet, View, ListView, Text, TouchableWithoutFeedback, Clipboard } from 'react-native';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import TransactionRow from '../components/transactionRow';
import Modal from 'react-native-modal';
import DropdownHolder from '../components/dropdownHolder';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
import { width, height } from '../util/dimensions';

class History extends React.Component {
    constructor(props) {
        super(props);
        this.state = { viewRef: null };
    }

    imageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    copyBundleHash(item) {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        Clipboard.setString(item);
        dropdown.alertWithType('success', t('bundleHashCopied'), t('bundleHashCopiedExplanation'));
    }

    copyAddress(item) {
        const { t } = this.props;
        const dropdown = DropdownHolder.getDropdown();
        Clipboard.setString(item);
        dropdown.alertWithType('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    render() {
        const { t } = this.props;
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        const addresses = Object.keys(currentSeedAccountInfo.addresses);
        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.props.closeTopBar()}>
                <View style={styles.container}>
                    <View style={styles.listView}>
                        <ListView
                            dataSource={ds.cloneWithRows(accountInfo[Object.keys(accountInfo)[seedIndex]].transfers)}
                            renderRow={dataSource => (
                                <TransactionRow
                                    addresses={addresses}
                                    rowData={dataSource}
                                    titleColor="#F8FFA6"
                                    onPress={event => this._showModal()}
                                    copyAddress={item => this.copyAddress(item)}
                                    copyBundleHash={item => this.copyBundleHash(item)}
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
});

const mapStateToProps = state => ({
    account: state.account,
    tempAccount: state.tempAccount,
});

export default translate(['history', 'global'])(connect(mapStateToProps)(History));
