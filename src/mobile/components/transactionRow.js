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

    _renderModalContent = (titleColour, isReceived, hasPersistence) => (
        <TouchableOpacity onPress={() => this._hideModal()}>
            <View style={{ flex: 1, justifyContent: 'center', width: width / 1.15 }}>
                <View style={[styles.modalContent, { backgroundColor: this.props.backgroundColor }]}>
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
                                    !hasPersistence && { color: '#f75602' },
                                ]}
                            >
                                {hasPersistence ? (isReceived ? 'Received' : 'Sent') : 'Pending'}
                            </Text>
                            <Text style={styles.modalTimestamp}>
                                {formatModalTime(convertUnixTimeToJSDate(this.props.rowData[0].timestamp))}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.modalBundleTitle}>Bundle Hash:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => this.props.copyBundleHash(this.props.rowData[0].bundle)}
                            style={{ flex: 7 }}
                        >
                            <Text style={styles.bundleHash} numberOfLines={2}>
                                {this.props.rowData[0].bundle}
                            </Text>
                            <View style={{ flex: 1 }} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalBundleTitle}>Addresses:</Text>
                    <ListView
                        dataSource={ds.cloneWithRows(this.props.rowData)}
                        renderRow={(rowData, sectionId) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}>
                                <TouchableOpacity
                                    onPress={() => this.props.copyAddress(rowData.address)}
                                    style={{ flex: 5.1 }}
                                >
                                    <Text style={styles.hash} numberOfLines={2}>
                                        {rowData.address}
                                    </Text>
                                </TouchableOpacity>
                                <View style={{ flex: 0.9 }}>
                                    <Text style={styles.modalValue} numberOfLines={1}>
                                        {' '}
                                        {round(formatValue(rowData.value), 1)} {formatUnit(rowData.value)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                    />
                    <Text style={styles.modalBundleTitle}>Message:</Text>
                    <Text style={styles.hash} numberOfLines={2}>
                        {convertFromTrytes(this.props.rowData[0].signatureMessageFragment)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    render() {
        const { negativeColor, positiveColor, backgroundColor, extraColor } = this.props;
        const hasPersistence = this.props.rowData[0].persistence;
        const isReceived = this.props.addresses.includes(this.props.rowData[0].address);
        const titleColour = isReceived ? extraColor : negativeColor;
        return (
            <TouchableOpacity onPress={() => this._showModal(this.props.rowData[0])}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={styles.container}>
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
                                    !hasPersistence && { color: '#f75602' },
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
                                <Text style={styles.messageTitle}>Message:</Text>
                                <Text style={styles.message} numberOfLines={1}>
                                    {convertFromTrytes(this.props.rowData[0].signatureMessageFragment)}
                                </Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={styles.timestamp}>
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
                    {this._renderModalContent(titleColour, isReceived, hasPersistence)}
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
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 0.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 1.2,
        height: height / 10,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        justifyContent: 'center',
    },
    title: {
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
    },
    modalTitle: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 31.8,
    },
    message: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    messageTitle: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 31.8,
        paddingRight: width / 70,
    },
    modalBundleTitle: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 31.8,
        paddingTop: height / 50,
    },
    hash: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    bundleHash: {
        color: 'white',
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
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    timestamp: {
        color: 'white',
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
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    modalStatus: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        paddingRight: width / 20,
    },
    modalValue: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'right',
    },
});

module.exports = TransactionRow;
