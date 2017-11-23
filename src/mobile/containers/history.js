import React from 'react';
import { TouchableOpacity, StyleSheet, View, ListView, Dimensions, Text } from 'react-native';
import { connect } from 'react-redux';
import TransactionRow from '../components/transactionRow';
import Modal from 'react-native-modal';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const width = Dimensions.get('window').width;
const height = global.height;

class History extends React.Component {
    constructor(props) {
        super(props);
        this.state = { viewRef: null };
    }

    imageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    render() {
        const accountInfo = this.props.account.accountInfo;
        const seedIndex = this.props.tempAccount.seedIndex;
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        const addresses = Object.keys(currentSeedAccountInfo.addresses);
        return (
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

export default connect(mapStateToProps)(History);
