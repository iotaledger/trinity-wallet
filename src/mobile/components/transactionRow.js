import React from 'react';
import { Clipboard, TouchableOpacity, View, Text, StyleSheet, Dimensions, ListView } from 'react-native';
import {
    formatTime,
    formatModalTime,
    formatValue,
    formatUnit,
    round,
    convertUnixTimeToJSDate,
} from '../../shared/libs/util';
import { convertFromTrytes } from '../../shared/libs/iota';
import Modal from 'react-native-modal';

const { height, width } = Dimensions.get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class TransactionRow extends React.Component {
    state = {
        isModalVisible: false,
    };

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    onBundleHashPress(bundleHash) {
        Clipboard.setString(bundleHash);
    }

    onAddressPress(address) {
        Clipboard.setString(address);
    }

    _renderModalContent = titleColour => (
        <TouchableOpacity onPress={() => this._hideModal()}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={styles.modalContent}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ marginRight: width / 5 }}>
                            <Text
                                style={{
                                    justifyContent: 'space-between',
                                    backgroundColor: 'transparent',
                                    fontFamily: 'Lato-Regular',
                                    fontSize: width / 29.6,
                                    marginBottom: 4,
                                    color: titleColour,
                                }}
                            >
                                {this.props.rowData[0].transferValue < 0 ? 'SEND' : 'RECEIVE'}{' '}
                                {round(formatValue(this.props.rowData[0].value), 1)}{' '}
                                {formatUnit(this.props.rowData[0].value)}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.modalStatus}>
                                {this.props.rowData[0].persistence
                                    ? this.props.rowData[0].transferValue < 0 ? 'Sent' : 'Received'
                                    : 'Pending'}
                            </Text>
                            <Text style={styles.modalTimestamp}>
                                {formatModalTime(convertUnixTimeToJSDate(this.props.rowData[0].timestamp))}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.modalBundleTitle}>Bundle Hash:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => this.onBundleHashPress(this.props.rowData[0].bundle)}
                            style={{ flex: 7 }}
                        >
                            <Text style={styles.hash} numberOfLines={2}>
                                {this.props.rowData[0].bundle}
                            </Text>
                            <View style={{ flex: 1 }} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.modalBundleTitle}>Addresses:</Text>
                    <ListView
                        dataSource={ds.cloneWithRows(this.props.rowData)}
                        renderRow={(rowData, sectionId) => (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => this.onAddressPress(rowData.address)}
                                    style={{ flex: 7 }}
                                >
                                    <Text style={styles.hash} numberOfLines={2}>
                                        {rowData.address}
                                    </Text>
                                </TouchableOpacity>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalValue}>
                                        {' '}
                                        {round(round(formatValue(rowData.value), 1), 1)} {formatUnit(rowData.value)}
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
        const titleColour = this.props.rowData[0].transferValue < 0 ? '#F7D002' : '#72BBE8';
        return (
            <TouchableOpacity onPress={() => this._showModal()}>
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
                                {this.props.rowData[0].transferValue < 0 ? 'SEND' : 'RECEIVE'}{' '}
                                {round(formatValue(this.props.rowData[0].value), 1)}{' '}
                                {formatUnit(this.props.rowData[0].value)}
                            </Text>
                            <Text style={styles.status}>
                                {this.props.rowData[0].persistence
                                    ? this.props.rowData[0].transferValue < 0 ? 'Sent' : 'Received'
                                    : 'Pending'}
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
                    backdropColor={'#132d38'}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                >
                    {this._renderModalContent(titleColour)}
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
        borderRadius: 8,
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
    status: {
        color: '#9DFFAF',
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
        backgroundColor: '#16313a',
        padding: width / 25,
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    modalStatus: {
        color: '#9DFFAF',
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
    separator: {
        flex: 1,
        height: 11,
    },
});

module.exports = TransactionRow;
