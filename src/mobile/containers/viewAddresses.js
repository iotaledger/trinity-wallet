import orderBy from 'lodash/orderBy';
import map from 'lodash/map';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { iota } from 'iota-wallet-shared-modules/libs/iota';
import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList, Clipboard } from 'react-native';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { width, height } from '../util/dimensions';

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
        width,
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
        width,
    },
    separator: {
        flex: 1,
        height: height / 60,
    },
    noAddressesContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    noAddresses: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    flatList: {
        flex: 1,
        justifyContent: 'center',
    },
});

export class ViewAddresses extends Component {
    static propTypes = {
        addressData: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        t: PropTypes.func.isRequired,
    };

    prepAddresses() {
        const { addressData } = this.props;

        const preparedAddresses = map(addressData, (data, address) => ({
            ...data,
            balance: round(formatValue(data.balance), 1),
            unit: formatUnit(data.balance),
            address: iota.utils.addChecksum(address, 9, true),
        }));

        return orderBy(preparedAddresses, 'index', ['desc']);
    }

    copy(address) {
        const { t } = this.props;

        Clipboard.setString(address);
        return this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    renderAddress(address) {
        const { secondaryBackgroundColor } = this.props;

        return (
            <View style={{ flexDirection: 'row', paddingHorizontal: width / 15 }}>
                <TouchableOpacity
                    onPress={() => this.copy(address.address)}
                    style={{ alignItems: 'flex-start', flex: 8, justifyContent: 'center' }}
                >
                    <View>
                        <Text
                            numberOfLines={2}
                            style={[
                                styles.addressText,
                                { textDecorationLine: address.spent ? 'line-through' : 'none' },
                                { color: secondaryBackgroundColor },
                            ]}
                        >
                            {address.address}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={{ alignItems: 'flex-end', flex: 2, justifyContent: 'center' }}>
                    <Text style={[styles.balanceText, { color: secondaryBackgroundColor }]}>
                        {address.balance} {address.unit}
                    </Text>
                </View>
            </View>
        );
    }

    renderAddresses() {
        const { secondaryBackgroundColor } = this.props;
        const addresses = this.prepAddresses();
        const noAddresses = addresses.length === 0;

        return (
            <FlatList
                contentContainerStyle={noAddresses ? styles.flatList : null}
                data={addresses}
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => this.renderAddress(item)}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.noAddressesContainer}>
                        <Text style={[styles.noAddresses, { color: secondaryBackgroundColor }]}>NO ADDRESSES</Text>
                    </View>
                }
            />
        );
    }

    render() {
        const { secondaryBackgroundColor, arrowLeftImagePath, t } = this.props;
        const addresses = this.renderAddresses();

        const textColor = { color: secondaryBackgroundColor };

        return (
            <View style={styles.container}>
                <View style={styles.listView}>{addresses}</View>
                <View style={{ flex: 0.2 }} />
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.backPress()}
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

const mapDispatchToProps = {
    generateAlert,
};

const mapStateToProps = (state) => ({
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ViewAddresses));
