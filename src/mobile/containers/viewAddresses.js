import orderBy from 'lodash/orderBy';
import map from 'lodash/map';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { iota } from 'iota-wallet-shared-modules/libs/iota';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { width, height } from '../util/dimensions';
import COLORS from '../theme/Colors';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    titleText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    spentText: {
        color: COLORS.redLight,
        textDecorationLine: 'line-through',
        marginRight: width / 100,
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 29.6,
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
        body: PropTypes.object.isRequired,
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
        const { body } = this.props;

        return (
            <View style={{ flexDirection: 'row', paddingHorizontal: width / 15, height: height / 25 }}>
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
                                { color: address.spent ? COLORS.redLight : body.color },
                            ]}
                        >
                            {address.address}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={{ alignItems: 'flex-end', flex: 2, justifyContent: 'center' }}>
                    <Text style={[styles.balanceText, { color: body.color }]}>
                        {address.balance} {address.unit}
                    </Text>
                </View>
            </View>
        );
    }

    renderAddresses() {
        const { body, t } = this.props;
        const addresses = this.prepAddresses();
        const noAddresses = addresses.length === 0;

        return (
            <OptimizedFlatList
                contentContainerStyle={noAddresses ? styles.flatList : null}
                data={addresses}
                initialNumToRender={10} // TODO: Should be dynamically computed.
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => this.renderAddress(item)}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={
                    <View style={styles.noAddressesContainer}>
                        <Text style={[styles.noAddresses, { color: body.color }]}>{t('noAddresses')}</Text>
                    </View>
                }
            />
        );
    }

    render() {
        const { body, t } = this.props;
        const listOfAddresses = this.renderAddresses();
        const addresses = this.prepAddresses();
        const textColor = { color: body.color };

        return (
            <View style={styles.container}>
                <View style={styles.listView}>
                    <View style={{ height: height / 2.5 + height / 60 * 9 }}>{listOfAddresses}</View>
                </View>
                <View style={{ flex: 0.2 }} />
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.backPress()}
                        style={{ flex: 1 }}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.itemLeft}>
                            <Icon name="chevronLeft" size={width / 28} color={body.color} />
                            <Text style={[styles.titleText, textColor]}>{t('global:backLowercase')}</Text>
                        </View>
                    </TouchableOpacity>
                    {addresses.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                            <Text style={styles.spentText}>ABC</Text>
                            <Text style={[styles.balanceText, textColor]}> = {t('spent')}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

const mapStateToProps = (state) => ({
    body: state.settings.theme.body,
});

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ViewAddresses));
