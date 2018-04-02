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
import { formatModalTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import CtaButton from '../components/CtaButton';

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
    buttonWhenDisabled: {
        opacity: 0.4,
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
        /** Container element press event callback function */
        onPress: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Rebroadcast bundle
         * @param {string} bundle - bundle hash
         */
        rebroadcast: PropTypes.func.isRequired,
        /** Promotes bundle
         * @param {string} bundle - bundle hash
         */
        promote: PropTypes.func.isRequired,
        /** Transaction incoming/outgoing state */
        status: PropTypes.string.isRequired,
        /** Transaction confirmation state */
        confirmation: PropTypes.string.isRequired,
        /** Transaction boolean confirmation state */
        confirmationBool: PropTypes.bool.isRequired,
        /** Currently selected mode */
        mode: PropTypes.oneOf(['Expert', 'Standard']).isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Transaction unit */
        unit: PropTypes.string.isRequired,
        /** Transaction time */
        time: PropTypes.number.isRequired,
        /** Transaction message */
        message: PropTypes.string,
        /** Transaction bundle hash */
        bundle: PropTypes.string.isRequired,
        /** Determines whether the modal buttons should disable onPress event */
        disableWhen: PropTypes.bool.isRequired,
        /** Transaction addresses */
        addresses: PropTypes.arrayOf(
            PropTypes.shape({
                address: PropTypes.string.isRequired,
                value: PropTypes.number.isRequired,
                unit: PropTypes.string.isRequired,
            }),
        ).isRequired,
        /** Content styles */
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            containerBorderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string.isRequired }).isRequired,
            confirmationStatusColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            buttonsOpacity: PropTypes.shape({ opacity: PropTypes.number.isRequired }).isRequired,
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

        if (types[type] && this.dropdown) {
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
            rebroadcast,
            promote,
            disableWhen,
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
                                        mode === 'Expert' &&
                                        value > 0 && (
                                            <View style={[styles.buttonsContainer, style.buttonsOpacity]}>
                                                <CtaButton
                                                    ctaColor={style.primaryColor}
                                                    secondaryCtaColor={style.primaryBody}
                                                    ctaWidth={width / 2.75}
                                                    ctaHeight={height / 17}
                                                    fontSize={width / 29.6}
                                                    text={t('promote')}
                                                    onPress={() => {
                                                        if (!disableWhen) {
                                                            promote(bundle);
                                                        }
                                                    }}
                                                />
                                                <CtaButton
                                                    ctaColor={style.secondaryColor}
                                                    secondaryCtaColor={style.secondaryBody}
                                                    ctaWidth={width / 2.75}
                                                    ctaHeight={height / 17}
                                                    fontSize={width / 29.6}
                                                    text={t('rebroadcast')}
                                                    onPress={() => {
                                                        if (!disableWhen) {
                                                            rebroadcast(bundle);
                                                        }
                                                    }}
                                                />
                                            </View>
                                        )}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                </View>
                <StatefulDropdownAlert
                    backgroundColor={style.barBg}
                    onRef={(c) => {
                        this.dropdown = c;
                    }}
                />
            </TouchableOpacity>
        );
    }
}
