import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet, ListView, ScrollView } from 'react-native';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
import { formatTime, formatModalTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import { convertFromTrytes, isReceivedTransfer, iota } from 'iota-wallet-shared-modules/libs/iota';
import { translate } from 'react-i18next';
import { extractTailTransferFromBundle } from 'iota-wallet-shared-modules/libs/transfers';
import Modal from 'react-native-modal';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: height / 60,
        paddingHorizontal: width / 30,
        borderWidth: 0.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 1.2,
        height: height / 10,
        justifyContent: 'center',
    },
    topWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    innerWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    messageOuterWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    messageInnerWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    timeWrapper: {
        flex: 1,
        alignItems: 'flex-end',
    },
    amountText: {
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        marginBottom: width / 100,
        color: 'red',
    },
    title: {
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
    },
    message: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    messageTitle: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 31.8,
        paddingRight: width / 70,
    },
    modalBundleTitle: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 31.8,
        paddingTop: height / 50,
    },
    hash: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Regular',
        fontSize: width / 31.8,
    },
    bundleHash: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Regular',
        fontSize: width / 31.8,
        marginTop: 2,
    },
    confirmationStatus: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    modalTimestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    modalContent: {
        width: width / 1.15,
        maxHeight: height / 1.05,
        padding: width / 25,
        justifyContent: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
    },
    modalStatus: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        paddingRight: width / 25,
    },
    modalValue: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'right',
    },
});

export default class TransferListItem extends PureComponent {
    static propTypes = {
        onItemPress: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        confirmation: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        messageTitle: PropTypes.string.isRequired,
        style: PropTypes.object.isRequired,
    };

    render() {
        const { onItemPress, status, confirmation, value, unit, time, message, messageTitle, style } = this.props;

        return (
            <TouchableOpacity onPress={onItemPress}>
                <View style={styles.topWrapper}>
                    <View style={[styles.container, style.containerBorderColor, style.containerBackgroundColor]}>
                        <View style={styles.innerWrapper}>
                            <Text style={styles.amountText}>
                                {status}
                                {value} {unit}
                            </Text>
                            <Text style={[styles.confirmationStatus, style.confirmationStatusColor]}>
                                {confirmation}
                            </Text>
                        </View>
                        <View style={styles.messageOuterWrapper}>
                            <View style={styles.messageInnerWrapper}>
                                <Text style={[styles.messageTitle, style.messageTextColor]}>{messageTitle}</Text>
                                <Text style={[styles.message, style.messageTextColor]} numberOfLines={1}>
                                    {message}
                                </Text>
                            </View>
                            <View style={styles.timeWrapper}>
                                <Text style={[styles.timestamp, style.messageTextColor]}>{time}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
