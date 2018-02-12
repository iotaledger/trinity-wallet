import React, { Component } from 'react';
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

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

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
    status: {
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

/* eslint-disable no-nested-ternary */
// FIXME: Remove nested ternary
class TransactionRow extends Component {
    static propTypes = {
        backgroundColor: PropTypes.string.isRequired,
        positiveColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        pendingColor: PropTypes.string.isRequired,
        rowData: PropTypes.array.isRequired,
        extraColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        borderColor: PropTypes.object.isRequired,
        addresses: PropTypes.array.isRequired,
        copyBundleHash: PropTypes.func.isRequired,
        copyAddress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    static addChecksum(address) {
        const addressesWithChecksum = iota.utils.addChecksum(address, 9, true);
        return addressesWithChecksum;
    }

    constructor() {
        super();

        this.state = {
            isModalVisible: false,
        };
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = (transfer, titleColour, isReceived, hasPersistence, textColor, borderColor, t) => (
        <TouchableOpacity style={{ width, height, alignItems: 'center' }} onPress={() => this.hideModal()}>
            <View style={{ flex: 1, justifyContent: 'center', width: width / 1.15 }}>
                <View style={[styles.modalContent, borderColor, { backgroundColor: this.props.backgroundColor }]}>
                    <ScrollView>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text
                                style={{
                                    justifyContent: 'space-between',
                                    backgroundColor: 'transparent',
                                    fontFamily: 'Lato-Regular',
                                    fontSize: width / 29.6,
                                    color: titleColour,
                                }}
                            >
                                {isReceived ? t('home:receive') : t('global:send')}{' '}
                                {round(formatValue(transfer.value), 1)} {formatUnit(transfer.value)}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text
                                    style={[
                                        styles.modalStatus,
                                        { color: this.props.positiveColor },
                                        !isReceived && { color: this.props.negativeColor },
                                        !hasPersistence && { color: this.props.pendingColor },
                                    ]}
                                >
                                    {hasPersistence
                                        ? isReceived ? t('global:received') : t('global:sent')
                                        : t('global:pending')}
                                </Text>
                                <Text style={[styles.modalTimestamp, textColor]}>
                                    {formatModalTime(convertUnixTimeToJSDate(transfer.timestamp))}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.modalBundleTitle, textColor]}>{t('bundleHash')}:</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => this.props.copyBundleHash(transfer.bundle)}
                                style={{ flex: 7 }}
                            >
                                <Text style={[styles.bundleHash, textColor]} numberOfLines={2}>
                                    {transfer.bundle}
                                </Text>
                                <View style={{ flex: 1 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.modalBundleTitle, textColor]}>{t('addresses')}:</Text>
                        <ListView
                            dataSource={ds.cloneWithRows(this.props.rowData)}
                            renderRow={(rowData) => (
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            this.props.copyAddress(TransactionRow.addChecksum(rowData.address))
                                        }
                                        style={{ flex: 4.7 }}
                                    >
                                        <Text style={[styles.hash, textColor]} numberOfLines={2}>
                                            {TransactionRow.addChecksum(rowData.address)}
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1.3 }}>
                                        <Text style={[styles.modalValue, textColor]} numberOfLines={1}>
                                            {' '}
                                            {round(formatValue(rowData.value), 1)} {formatUnit(rowData.value)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                            renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                            enableEmptySections
                        />
                        <Text style={[styles.modalBundleTitle, textColor]}>{t('send:message')}:</Text>
                        <Text style={[styles.hash, textColor]}>
                            {convertFromTrytes(transfer.signatureMessageFragment)}
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </TouchableOpacity>
    );

    render() {
        const {
            negativeColor,
            positiveColor,
            backgroundColor,
            extraColor,
            textColor,
            secondaryBackgroundColor,
            borderColor,
            pendingColor,
            addresses,
            rowData,
            t,
        } = this.props;
        const isReceived = isReceivedTransfer(rowData, addresses);
        const transfer = extractTailTransferFromBundle(rowData);
        const hasPersistence = rowData[0].persistence;
        const titleColour = isReceived ? extraColor : negativeColor;
        const containerBorderColor =
            secondaryBackgroundColor === 'white'
                ? { borderColor: 'rgba(255, 255, 255, 0.25)' }
                : { borderColor: 'rgba(0, 0, 0, 0.25)' };
        const containerBackgroundColor =
            secondaryBackgroundColor === 'white'
                ? { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
                : { backgroundColor: 'transparent' };

        return (
            <TouchableOpacity onPress={() => this.showModal(transfer)}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={[styles.container, containerBorderColor, containerBackgroundColor]}>
                        <View
                            style={{
                                flexDirection: 'row',
                                flex: 1,
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Text
                                style={{
                                    justifyContent: 'space-between',
                                    backgroundColor: 'transparent',
                                    fontFamily: 'Lato-Regular',
                                    fontSize: width / 31.8,
                                    marginBottom: width / 100,
                                    color: titleColour,
                                }}
                            >
                                {isReceived ? t('home:receive') : t('global:send')}{' '}
                                {round(formatValue(transfer.value), 1)} {formatUnit(transfer.value)}
                            </Text>
                            <Text
                                style={[
                                    styles.status,
                                    { color: positiveColor },
                                    !isReceived && { color: positiveColor },
                                    !hasPersistence && { color: pendingColor },
                                ]}
                            >
                                {hasPersistence
                                    ? isReceived ? t('global:received') : t('global:sent')
                                    : t('global:pending')}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                flex: 1,
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    flex: 1,
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={[styles.messageTitle, textColor]}>{t('send:message')}:</Text>
                                <Text style={[styles.message, textColor]} numberOfLines={1}>
                                    {convertFromTrytes(transfer.signatureMessageFragment)}
                                </Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={[styles.timestamp, textColor]}>
                                    {formatTime(convertUnixTimeToJSDate(transfer.timestamp))}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={backgroundColor}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                    onBackButtonPress={() => this.hideModal()}
                >
                    {this.renderModalContent(
                        transfer,
                        titleColour,
                        isReceived,
                        hasPersistence,
                        textColor,
                        borderColor,
                        t,
                    )}
                </Modal>
            </TouchableOpacity>
        );
    }
}

export default translate(['global', 'send', 'home'])(TransactionRow);
