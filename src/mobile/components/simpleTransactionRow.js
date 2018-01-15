import get from 'lodash/get';
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { round, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import { isReceivedTransfer } from 'iota-wallet-shared-modules/libs/iota';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import whiteSendImagePath from 'iota-wallet-shared-modules/images/send-white.png';
import whiteReceiveImagePath from 'iota-wallet-shared-modules/images/receive-white.png';
import blackSendImagePath from 'iota-wallet-shared-modules/images/send-black.png';
import blackReceiveImagePath from 'iota-wallet-shared-modules/images/receive-black.png';

import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        flexDirection: 'row',
        height: height / 40,
        alignItems: 'center',
        paddingHorizontal: width / 10,
    },
    icon: {
        width: width / 35,
        height: width / 35,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 32,
        fontWeight: '400',
    },
});

class SimpleTransactionRow extends Component {
    render() {
        const { t, rowData, addresses, negativeColor, extraColor, secondaryBackgroundColor } = this.props;
        const sign = rowData[0].transferValue < 0 ? '-' : '+';
        const address = get(rowData, '[0].address');
        const isReceived = isReceivedTransfer(rowData, addresses);
        const titleColour = isReceived ? extraColor : negativeColor;
        const sendImagePath = secondaryBackgroundColor === 'white' ? whiteSendImagePath : blackSendImagePath;
        const receiveImagePath = secondaryBackgroundColor === 'white' ? whiteReceiveImagePath : blackReceiveImagePath;
        const icon = rowData[0].transferValue < 0 ? sendImagePath : receiveImagePath;

        return (
            <View style={styles.container}>
                <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
                    <Image source={icon} style={styles.icon} />
                </View>
                <View style={{ flex: 3, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, { color: titleColour, padding: 5 }]}>
                        {formatTime(convertUnixTimeToJSDate(rowData[0].timestamp))}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, { color: titleColour }]}>
                        {isReceived
                            ? rowData[0].persistence ? 'Received' : 'Receiving'
                            : rowData[0].persistence ? 'Sent' : 'Sending'}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-end' }}>
                    <Text style={[styles.text, { color: titleColour }]}>
                        {sign} {round(formatValue(rowData[0].value), 1)} {formatUnit(rowData[0].value)}
                    </Text>
                </View>
            </View>
        );
    }
}

module.exports = SimpleTransactionRow;
