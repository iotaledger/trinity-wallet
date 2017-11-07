import React from 'react';
import { TouchableOpacity, StyleSheet, View, ListView, Dimensions, Text } from 'react-native';
import { connect } from 'react-redux';
import TransactionRow from '../components/transactionRow';
import Modal from 'react-native-modal';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const { height, width } = Dimensions.get('window');

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
        return (
            <View style={styles.container}>
                <View style={styles.listView}>
                    <ListView
                        dataSource={ds.cloneWithRows(accountInfo[Object.keys(accountInfo)[seedIndex]].transfers)}
                        renderRow={dataSource => (
                            <TransactionRow
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
                        snapToInterval={height / 7.4453}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    listView: {
        height: height / 1.49,
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
