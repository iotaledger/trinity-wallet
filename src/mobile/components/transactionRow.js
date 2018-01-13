import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, ListView } from 'react-native';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
import { formatTime, formatModalTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import { convertFromTrytes } from 'iota-wallet-shared-modules/libs/iota';
import Modal from 'react-native-modal';
import GENERAL from '../theme/general';

import { width, height } from '../util/dimensions';
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class TransactionRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
        };
    }

    _showModal = data => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = (titleColour, isReceived, hasPersistence, textColor, borderColor) => (
        <TouchableOpacity onPress={() => this._hideModal()}>
            <View style={{ flex: 1, justifyContent: 'center', width: width / 1.15 }}>
                <View style={[styles.modalContent, borderColor, { backgroundColor: this.props.backgroundColor }]}>
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
                            {isReceived ? 'RECEIVE' : 'SEND'} {round(formatValue(this.props.rowData[0].value), 1)}{' '}
                            {formatUnit(this.props.rowData[0].value)}
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
                                {hasPersistence ? (isReceived ? 'Received' : 'Sent') : 'Pending'}
                            </Text>
                            <Text style={[styles.modalTimestamp, textColor]}>
                                {formatModalTime(convertUnixTimeToJSDate(this.props.rowData[0].timestamp))}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.modalBundleTitle, textColor]}>Bundle Hash:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => this.props.copyBundleHash(this.props.rowData[0].bundle)}
                            style={{ flex: 7 }}
                        >
                            <Text style={[styles.bundleHash, textColor]} numberOfLines={2}>
                                {this.props.rowData[0].bundle}
                            </Text>
                            <View style={{ flex: 1 }} />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.modalBundleTitle, textColor]}>Addresses:</Text>
                    <ListView
                        dataSource={ds.cloneWithRows(this.props.rowData)}
                        renderRow={(rowData, sectionId) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}>
                                <TouchableOpacity
                                    onPress={() => this.props.copyAddress(rowData.address)}
                                    style={{ flex: 5.1 }}
                                >
                                    <Text style={[styles.hash, textColor]} numberOfLines={2}>
                                        {rowData.address}
                                    </Text>
                                </TouchableOpacity>
                                <View style={{ flex: 0.9 }}>
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
                    <Text style={[styles.modalBundleTitle, textColor]}>Message:</Text>
                    <Text style={[styles.hash, textColor]}>
                        {convertFromTrytes(this.props.rowData[0].signatureMessageFragment)}
                    </Text>
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
        } = this.props;
        const hasPersistence = this.props.rowData[0].persistence;
        const isReceived = this.props.addresses.includes(this.props.rowData[0].address);
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
            <TouchableOpacity onPress={() => this._showModal(this.props.rowData[0])}>
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
                                {isReceived ? 'RECEIVE' : 'SEND'} {round(formatValue(this.props.rowData[0].value), 1)}{' '}
                                {formatUnit(this.props.rowData[0].value)}
                            </Text>
                            <Text
                                style={[
                                    styles.status,
                                    { color: positiveColor },
                                    !isReceived && { color: negativeColor },
                                    !hasPersistence && { color: pendingColor },
                                ]}
                            >
                                {hasPersistence ? (isReceived ? 'Received' : 'Sent') : 'Pending'}
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
                                <Text style={[styles.messageTitle, textColor]}>Message:</Text>
                                <Text style={[styles.message, textColor]} numberOfLines={1}>
                                    {convertFromTrytes(this.props.rowData[0].signatureMessageFragment)}
                                </Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={[styles.timestamp, textColor]}>
                                    {formatTime(convertUnixTimeToJSDate(this.props.rowData[0].timestamp))}
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
                >
                    {this._renderModalContent(titleColour, isReceived, hasPersistence, textColor, borderColor)}
                </Modal>
            </TouchableOpacity>
        );
    }
}

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
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    bundleHash: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
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
        padding: width / 25,
        justifyContent: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
    },
    modalStatus: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        paddingRight: width / 20,
    },
    modalValue: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'right',
    },
});

module.exports = TransactionRow;
