import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    Clipboard,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    FlatList,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import { formatModalTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import StatefulDropdownAlert from '../containers/statefulDropdownAlert';
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
    button: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 4,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: height / 40,
    },
});

export default class HistoryModalContent extends PureComponent {
    static propTypes = {
        onPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        confirmation: PropTypes.string.isRequired,
        confirmationBool: PropTypes.bool.isRequired,
        mode: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        time: PropTypes.number.isRequired,
        message: PropTypes.string,
        bundle: PropTypes.string.isRequired,
        addresses: PropTypes.arrayOf(
            PropTypes.shape({
                address: PropTypes.string.isRequired,
                value: PropTypes.number.isRequired,
                unit: PropTypes.string.isRequired,
            }),
        ).isRequired,
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            containerBorderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string.isRequired }).isRequired,
            confirmationStatusColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
        }).isRequired,
    };

    static defaultProps = {
        message: 'Empty',
    };

    copy(item, type) {
        const { t } = this.props;

        const types = {
            bundle: [t('bundleHashCopied'), t('bundleHashCopiedExplanation')],
            address: [t('addressCopied'), t('addressCopiedExplanation')],
        };

        Clipboard.setString(item);

        if (types[type]) {
            this.dropdown.alertWithType('success', ...types[type]);
        }
    }

    renderAddressRow(address) {
        const { style } = this.props;

        return (
            <View style={styles.addressRowContainer}>
                <TouchableOpacity
                    onPress={() => this.copy(address.address, 'address')}
                    style={styles.addressRowTopWrapper}
                >
                    <Text style={[styles.text, style.defaultTextColor]} numberOfLines={2}>
                        {address.address}
                    </Text>
                </TouchableOpacity>
                <View style={styles.addressRowBottomWrapper}>
                    <Text style={[styles.addressRowValue, style.defaultTextColor]} numberOfLines={1}>
                        {address.value} {address.unit}
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
        const {
            status,
            onPress,
            value,
            unit,
            confirmation,
            confirmationBool,
            time,
            bundle,
            message,
            t,
            style,
            mode,
        } = this.props;

        return (
            <TouchableOpacity style={styles.container} onPress={onPress}>
                <View style={styles.wrapper}>
                    <View style={[styles.content, style.borderColor, { backgroundColor: style.backgroundColor }]}>
                        <ScrollView>
                            <TouchableWithoutFeedback style={{ flex: 1 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.statusWrapper}>
                                        <Text style={[styles.statusText, { color: style.titleColor }]}>
                                            {status} {value} {unit}
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
                                            onPress={() => this.copy(bundle, 'bundle')}
                                            style={styles.bundleInnerWrapper}
                                        >
                                            <Text style={[styles.bundleHash, style.defaultTextColor]} numberOfLines={2}>
                                                {bundle}
                                            </Text>
                                            <View style={styles.bundleSeparator} />
                                        </TouchableOpacity>
                                    </View>
                                    {mode === 'Expert' && (
                                        <View>
                                            <Text style={[styles.heading, style.defaultTextColor]}>
                                                {t('addresses')}:
                                            </Text>
                                            {this.renderAddresses()}
                                        </View>
                                    )}
                                    <Text style={[styles.heading, style.defaultTextColor]}>{t('send:message')}:</Text>
                                    <Text style={[styles.text, style.defaultTextColor]}>{message}</Text>
                                    {!confirmationBool &&
                                        mode === 'Expert' && (
                                            <View style={styles.buttonsContainer}>
                                                <TouchableOpacity style={[styles.button, style.borderColor]}>
                                                    <Text style={[styles.buttonText, style.defaultTextColor]}>
                                                        {t('reattach')}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.button, style.borderColor]}>
                                                    <Text style={[styles.buttonText, style.defaultTextColor]}>
                                                        {t('promote')}
                                                    </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.button, style.borderColor]}>
                                                    <Text style={[styles.buttonText, style.defaultTextColor]}>
                                                        {t('rebroadcast')}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                </View>
                <StatefulDropdownAlert
                    textColor={style.secondaryBarColor}
                    backgroundColor={style.barColor}
                    onRef={(c) => {
                        this.dropdown = c;
                    }}
                />
            </TouchableOpacity>
        );
    }
}
