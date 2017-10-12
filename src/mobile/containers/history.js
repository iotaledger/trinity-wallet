import React from 'react';
import { StyleSheet, View, ListView, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import TransactionRow from '../components/transactionRow';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const { height, width } = Dimensions.get('window');

class History extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <ListView
                    dataSource={ds.cloneWithRows(this.props.iota.transactions)}
                    renderRow={dataSource => <TransactionRow rowData={dataSource} titleColor="#F8FFA6" />}
                    renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                    enableEmptySections
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: height / 20
    },
    separator: {
        flex: 1,
        height: 11
    }
});

const mapStateToProps = state => ({
    iota: state.iota
});

export default connect(mapStateToProps)(History);
