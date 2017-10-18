import React from 'react';
import { TouchableOpacity, StyleSheet, View, ListView, Dimensions, Text } from 'react-native';
import { connect } from 'react-redux';
import TransactionRow from '../components/transactionRow';
import Modal from 'react-native-modal';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const { height, width } = Dimensions.get('window');

class History extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topContainer} />
                <View style={styles.listView}>
                    <ListView
                        dataSource={ds.cloneWithRows(this.props.iota.transactions)}
                        renderRow={dataSource => (
                            <TransactionRow
                                rowData={dataSource}
                                titleColor="#F8FFA6"
                                onPress={event => this._showModal()}
                            />
                        )}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: height / 20,
    },
    topContainer: {
        flex: 1,
    },
    listView: {
        flex: 14,
    },
    separator: {
        flex: 1,
        height: 11,
    },
});

const mapStateToProps = state => ({
    iota: state.iota,
});

export default connect(mapStateToProps)(History);
