import get from 'lodash/get';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { round, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';

import { width, height } from '../util/dimensions';

class SimpleTransactionRow extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { t } = this.props;
        const icon =
            this.props.rowData[0].transferValue < 0
                ? require('iota-wallet-shared-modules/images/send.png')
                : require('iota-wallet-shared-modules/images/receive.png');
        const sign = this.props.rowData[0].transferValue < 0 ? '-' : '+';
        const address = get(this.props.rowData, '[0].address');
        const sendOrReceive = this.props.addresses.includes(address);
        const titleColour = sendOrReceive ? '#72BBE8' : '#F7D002';

        return (
            <View style={styles.container}>
                <View style={{ flex: 0.5 }}>
                    <Image source={icon} style={styles.icon} />
                </View>
                <View style={{ flex: 3, alignItems: 'flex-start' }}>
                    <Text
                        style={{
                            color: titleColour,
                            backgroundColor: 'transparent',
                            padding: 5,
                            fontFamily: 'Lato-Bold',
                            fontSize: width / 29.6,
                        }}
                    >
                        {formatTime(convertUnixTimeToJSDate(this.props.rowData[0].timestamp))}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-start' }}>
                    <Text
                        style={{
                            color: titleColour,
                            backgroundColor: 'transparent',
                            fontFamily: 'Lato-Bold',
                            fontSize: width / 29.6,
                        }}
                    >
                        {sendOrReceive
                            ? this.props.rowData[0].persistence ? 'Received' : 'Receiving'
                            : this.props.rowData[0].persistence ? 'Sent' : 'Sending'}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-end' }}>
                    <Text
                        style={{
                            color: titleColour,
                            backgroundColor: 'transparent',
                            fontFamily: 'Lato-Bold',
                            fontSize: width / 29.6,
                        }}
                    >
                        {sign} {round(formatValue(this.props.rowData[0].value), 1)}{' '}
                        {formatUnit(this.props.rowData[0].value)}
                    </Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        height: height / 40,
        width: width / 1.5,
        alignItems: 'center',
    },
    icon: {
        width: width / 30,
        height: width / 30,
    },
});

module.exports = SimpleTransactionRow;
