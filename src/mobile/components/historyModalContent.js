import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { formatModalTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        width,
        height,
        alignItems: 'center',
    },
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        width: width / 1.15,
    },
    content: {
        width: width / 1.15,
        maxHeight: height / 1.05,
        padding: width / 25,
        justifyContent: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
    },
    statusWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusText: {
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
    },
    valueText: {
        marginLeft: 2,
    },
    confirmationWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bundleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bundleInnerWrapper: {
        flex: 7,
    },
    bundleHash: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Regular',
        fontSize: width / 31.8,
        marginTop: 2,
    },
    bundleSeparator: {
        flex: 1,
    },
    confirmation: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        paddingRight: width / 25,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    heading: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 31.8,
        paddingTop: height / 50,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Regular',
        fontSize: width / 31.8,
    },
    addressRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    addressRowTopWrapper: {
        flex: 4.7,
    },
    addressRowBottomWrapper: {
        flex: 1.3,
    },
    addressRowValue: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'right',
    },
});

export default class HistoryModalContent extends PureComponent {
    static propTypes = {
        onPress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        confirmation: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        time: PropTypes.number.isRequired,
        message: PropTypes.string.isRequired,
        bundle: PropTypes.string.isRequired,
        addresses: PropTypes.array.isRequired,
        style: PropTypes.shape({
            titleColor: PropTypes.string,
            containerBorderColor: PropTypes.shape({ borderColor: PropTypes.string }).isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string }).isRequired,
            confirmationStatusColor: PropTypes.shape({ color: PropTypes.string }).isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string }).isRequired,
            backgroundColor: PropTypes.string,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string }).isRequired,
        }).isRequired,
    };

    renderAddressRow(address) {
        const { value, unit, style } = this.props;

        return (
            <View style={styles.addressRowContainer}>
                <TouchableOpacity onPress={() => {}} style={styles.addressRowTopWrapper}>
                    <Text style={[styles.text, style.defaultTextColor]} numberOfLines={2}>
                        {address}
                    </Text>
                </TouchableOpacity>
                <View style={styles.addressRowBottomWrapper}>
                    <Text style={[styles.addressRowValue, style.defaultTextColor]} numberOfLines={1}>
                        {value} {unit}
                    </Text>
                </View>
            </View>
        );
    }

    renderAddresses() {
        const { addresses } = this.props;

        return (
            <FlatList
                data={addresses}
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => this.renderAddressRow(item)}
                ItemSeparatorComponent={() => <View />}
            />
        );
    }

    render() {
        const { status, onPress, value, unit, confirmation, time, bundle, message, addresses, t, style } = this.props;

        return (
            <TouchableOpacity style={styles.container} onPress={onPress}>
                <View style={styles.wrapper}>
                    <View style={[styles.content, style.borderColor, { backgroundColor: style.backgroundColor }]}>
                        <ScrollView>
                            <View style={styles.statusWrapper}>
                                <Text style={[styles.statusText, { color: style.titleColor }]}>
                                    <Text>
                                        {status} {value} {unit}
                                    </Text>
                                </Text>
                                <View style={styles.confirmationWrapper}>
                                    <Text style={[styles.confirmation, style.confirmationStatusColor]}>
                                        {confirmation}
                                    </Text>
                                    <Text style={[styles.timestamp, style.defaultTextColor]}>
                                        {formatModalTime(convertUnixTimeToJSDate(time))}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.heading, style.defaultTextColor]}>{t('bundleHash')}:</Text>
                            <View style={styles.bundleWrapper}>
                                <TouchableOpacity
                                    onPress={() => console.log('Copied')}
                                    style={styles.bundleInnerWrapper}
                                >
                                    <Text style={[styles.bundleHash, style.defaultTextColor]} numberOfLines={2}>
                                        {bundle}
                                    </Text>
                                    <View style={styles.bundleSeparator} />
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.heading, style.defaultTextColor]}>{t('addresses')}:</Text>
                            {this.renderAddresses(addresses)}
                            <Text style={[styles.heading, style.defaultTextColor]}>{t('send:message')}:</Text>
                            <Text style={[styles.text, style.defaultTextColor]}>{message}</Text>
                        </ScrollView>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
