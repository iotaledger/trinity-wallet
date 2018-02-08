import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Image } from 'react-native';
import { round, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import { isReceivedTransfer } from 'iota-wallet-shared-modules/libs/iota';
import { extractTailTransferFromBundle } from 'iota-wallet-shared-modules/libs/transfers';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import whiteSendImagePath from 'iota-wallet-shared-modules/images/send-white.png';
import whiteReceiveImagePath from 'iota-wallet-shared-modules/images/receive-white.png';
import blackSendImagePath from 'iota-wallet-shared-modules/images/send-black.png';
import blackReceiveImagePath from 'iota-wallet-shared-modules/images/receive-black.png';
import { translate } from 'react-i18next';

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

/* eslint-disable react/prefer-stateless-function */
class SimpleTransactionRow extends Component {
    static propTypes = {
        rowData: PropTypes.array.isRequired,
        addresses: PropTypes.array.isRequired,
        negativeColor: PropTypes.string.isRequired,
        extraColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
    };

    render() {
        const { rowData, addresses, negativeColor, extraColor, secondaryBackgroundColor, t } = this.props;
        const transfer = extractTailTransferFromBundle(rowData);
        const isReceived = isReceivedTransfer(rowData, addresses);
        let sign = isReceived ? '+' : '-';
        sign = transfer.value === 0 ? '' : sign;
        const titleColour = isReceived ? extraColor : negativeColor;
        const sendImagePath = secondaryBackgroundColor === 'white' ? whiteSendImagePath : blackSendImagePath;
        const receiveImagePath = secondaryBackgroundColor === 'white' ? whiteReceiveImagePath : blackReceiveImagePath;
        const icon = isReceived ? receiveImagePath : sendImagePath;

        return (
            <View style={styles.container}>
                <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
                    <Image source={icon} style={styles.icon} />
                </View>
                <View style={{ flex: 3, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, { color: secondaryBackgroundColor, padding: 5 }]}>
                        {formatTime(convertUnixTimeToJSDate(transfer.timestamp))}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, { color: secondaryBackgroundColor }]}>
                        {isReceived
                            ? rowData[0].persistence ? t('received') : t('receiving')
                            : rowData[0].persistence ? t('sent') : t('sending')}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-end' }}>
                    <Text style={[styles.text, { color: titleColour }]}>
                        {sign} {round(formatValue(transfer.value), 1)} {formatUnit(transfer.value)}
                    </Text>
                </View>
            </View>
        );
    }
}

export default translate('global')(SimpleTransactionRow);
