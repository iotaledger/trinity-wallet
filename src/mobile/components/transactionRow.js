import React, { Component } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { formatTime, formatValue, formatUnit, round } from '../../shared/libs/util';

const { height, width } = Dimensions.get('window');

class TransactionRow extends Component {
    render() {
        const titleColour = this.props.rowData[0].transactionValue < 0 ? '#F7D002' : '#72BBE8';
        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={styles.container}>
                    <View style={{ flex: 3 }}>
                        <Text
                            style={{
                                color: titleColour,
                                justifyContent: 'space-between',
                                backgroundColor: 'transparent',
                                fontFamily: 'Lato-Regular',
                                fontSize: width / 33.75,
                                paddingBottom: 4,
                            }}
                        >
                            {this.props.rowData[0].transactionValue < 0 ? 'SEND' : 'RECEIVE'}{' '}
                            {round(formatValue(this.props.rowData[0].value), 1)}{' '}
                            {formatUnit(this.props.rowData[0].value)}
                        </Text>
                        <Text style={styles.bundleTitle}>Bundle Hash:</Text>
                        <Text style={styles.hash} numberOfLines={2}>
                            {this.props.rowData[0].bundle}
                        </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <Text style={styles.status}>
                            {this.props.rowData[0].persistence
                                ? this.props.rowData[0].transactionValue < 0 ? 'Sent' : 'Received'
                                : 'Pending'}
                        </Text>
                        <Text style={styles.timestamp}>{formatTime(this.props.rowData[0].timestamp)}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: height / 80,
        paddingBottom: height / 60,
        paddingHorizontal: width / 30,
        flexDirection: 'row',
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 0.5,
        borderRadius: 8,
        width: width / 1.2,
        height: height / 10,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'center',
    },
    bundleTitle: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 40.5,
    },
    hash: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 40.5,
    },
    status: {
        color: '#9DFFAF',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
        paddingTop: 2,
    },
    timestamp: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
    },
});

export default TransactionRow;
