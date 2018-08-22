import orderBy from 'lodash/orderBy';
import map from 'lodash/map';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { OptimizedFlatList } from 'react-native-optimized-flatlist';
import { selectAccountInfo } from 'shared/selectors/accounts';
import { round } from 'shared/libs/utils';
import { formatValue, formatUnit } from 'shared/libs/iota/utils';
import { generateAlert } from 'shared/actions/alerts';
import { setSetting } from 'shared/actions/wallet';
import { width, height } from 'mobile/src/libs/dimensions';
import { Icon } from 'mobile/src/ui/theme/icons.js';
import GENERAL from 'mobile/src/ui/theme/general';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';

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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    spentText: {
        color: '#B21C17',
        textDecorationLine: 'line-through',
        marginRight: width / 100,
        fontFamily: 'SourceCodePro-Medium',
        fontSize: GENERAL.fontSize2,
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
        fontFamily: 'SourceCodePro-Medium',
        fontSize: GENERAL.fontSize2,
        textDecorationStyle: 'solid',
    },
    balanceText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
        textAlign: 'right',
    },
    listView: {
        flex: 11,
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    flatList: {
        flex: 1,
        justifyContent: 'center',
    },
});

/** View Addresses component */
export class ViewAddresses extends Component {
    static propTypes = {
        /** Selected account. Contains transfers, addresses and balance  */
        selectedAccount: PropTypes.object.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('ViewAddresses');
    }

    /**
     * Converts address data (object) to an array and orders it by key index
     *
     * @method prepAddresses
     * @returns {Array}
     */
    prepAddresses() {
        const { addresses } = this.props.selectedAccount;

        const preparedAddresses = map(addresses, (data, address) => ({
            ...data,
            balance: round(formatValue(data.balance), 1),
            unit: formatUnit(data.balance),
            address: `${address}${data.checksum}`,
        }));

        return orderBy(preparedAddresses, 'index', ['desc']);
    }

    /**
     * Copies address to clipboard
     * @method copy
     * @param {string} address
     */
    copy(address) {
        const { t } = this.props;

        Clipboard.setString(address);
        return this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    renderAddress(address) {
        const { theme } = this.props;

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
                                { color: address.spent ? '#B21C17' : theme.body.color },
                            ]}
                        >
                            {address.address}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={{ alignItems: 'flex-end', flex: 2, justifyContent: 'center' }}>
                    <Text style={[styles.balanceText, { color: theme.body.color }]}>
                        {address.balance} {address.unit}
                    </Text>
                </View>
            </View>
        );
    }

    renderAddresses() {
        const { theme, t } = this.props;
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
                        <Text style={[styles.noAddresses, { color: theme.body.color }]}>{t('noAddresses')}</Text>
                    </View>
                }
            />
        );
    }

    render() {
        const { theme, t } = this.props;
        const listOfAddresses = this.renderAddresses();
        const addresses = this.prepAddresses();
        const textColor = { color: theme.body.color };

        return (
            <View style={styles.container}>
                <View style={styles.listView}>
                    <View style={{ height: height / 2.5 + height / 60 * 9 }}>{listOfAddresses}</View>
                </View>
                <View style={{ flex: 0.2 }} />
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('accountManagement')}
                        style={{ flex: 1 }}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.itemLeft}>
                            <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                            <Text style={[styles.titleText, textColor]}>{t('global:back')}</Text>
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
    setSetting,
};

const mapStateToProps = (state) => ({
    selectedAccount: selectAccountInfo(state),
    theme: state.settings.theme,
});

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ViewAddresses));
