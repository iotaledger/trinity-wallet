import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Image, View, Text, StyleSheet, TouchableOpacity, ListView, Clipboard } from 'react-native';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { width, height } from '../util/dimensions';
import { translate } from 'react-i18next';
import { iota } from 'iota-wallet-shared-modules/libs/iota';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class ViewAddresses extends Component {
    static propTypes = {
        addressData: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
    };

    copy(address) {
        const { t } = this.props;

        Clipboard.setString(address);
        return this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    addChecksums(data) {
        addressesWithChecksums = data.map(item => iota.utils.addChecksum(item[0], 9, true));
        for (var i = 0; i < data.length; i++) {
            data[i][0] = addressesWithChecksums[i];
        }
        return data;
    }

    render() {
        const { secondaryBackgroundColor, arrowLeftImagePath, t } = this.props;
        let addressData = Object.entries(this.props.addressData);
        addressData = addressData.reverse();
        addressData = this.addChecksums(addressData);
        const textColor = { color: secondaryBackgroundColor };

        return (
            <View style={styles.container}>
                <View style={styles.listView}>
                    <ListView
                        dataSource={ds.cloneWithRows(addressData)}
                        renderRow={(rowData, sectionID, rowID) => (
                            <View style={{ flexDirection: 'row', paddingHorizontal: width / 15 }}>
                                <TouchableOpacity
                                    onPress={() => this.copy(rowData[0])}
                                    style={{ alignItems: 'flex-start', flex: 8, justifyContent: 'center' }}
                                >
                                    <View>
                                        <Text
                                            numberOfLines={2}
                                            style={[
                                                styles.addressText,
                                                { textDecorationLine: rowData[1].spent ? 'line-through' : 'none' },
                                                textColor,
                                            ]}
                                        >
                                            {rowData[0]}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ alignItems: 'flex-end', flex: 2, justifyContent: 'center' }}>
                                    <Text style={[styles.balanceText, textColor]}>
                                        {round(formatValue(rowData[1].balance), 1)} {formatUnit(rowData[1].balance)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        contentContainerView={{ flex: 1 }}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                    />
                </View>
                <View style={{ flex: 0.2 }} />
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        onPress={event => this.props.backPress()}
                        style={{ flex: 1 }}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.itemLeft}>
                            <Image source={arrowLeftImagePath} style={styles.icon} />
                            <Text style={[styles.titleText, textColor]}>{t('global:backLowercase')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    icon: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    bottomContainer: {
        flex: 1,
        width: width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressText: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 29.6,
        textDecorationStyle: 'solid',
    },
    balanceText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        textAlign: 'right',
    },
    listView: {
        flex: 8.8,
        justifyContent: 'center',
        width: width,
    },
    separator: {
        flex: 1,
        height: height / 60,
    },
});

const mapDispatchToProps = {
    generateAlert,
};

const mapStateToProps = state => ({
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ViewAddresses));
