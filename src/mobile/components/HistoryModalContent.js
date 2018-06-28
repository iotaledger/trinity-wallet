import assign from 'lodash/assign';
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
    ActivityIndicator,
} from 'react-native';
import { formatModalTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { isAndroid, locale } from '../utils/device';
import CtaButton from '../components/CtaButton';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        width,
        height,
        alignItems: 'center',
    },
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height,
    },
    content: {
        width: width / 1.15,
        maxHeight: height / 1.25,
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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
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
        fontSize: GENERAL.fontSize2,
        marginTop: 2,
    },
    bundleSeparator: {
        flex: 1,
    },
    confirmation: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
        paddingRight: width / 25,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
    },
    heading: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize2,
        paddingTop: height / 50,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Regular',
        fontSize: GENERAL.fontSize2,
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
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'right',
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: height / 40,
        height: height / 17,
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification titleinactivityLogoutContainer
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Determines if wallet is broadcasting bundle */
        isBroadcastingBundle: PropTypes.bool.isRequired,
        /** Content styles */
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
        }).isRequired,
        /** Bundle hash for the transaction that is currently being promoted */
        currentlyPromotingBundleHash: PropTypes.string.isRequired,
        /* eslint-disable react/no-unused-prop-types */
        /** Checks if the bundle hash belongs to a failed transaction
         * @param {string} bundleHash
         */
        isFailedTransaction: PropTypes.func.isRequired,
        /** Retries failed transaction
         * @param {string} bundleHash
         */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** Determines if a failed transaction is being retried */
        isRetryingFailedTransaction: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        message: 'Empty',
    };

    constructor(props) {
        super(props);
        this.state = {
            scrollable: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('HistoryModalContent');
    }

    setScrollable(y) {
        if (y >= height / 1.25) {
            return this.setState({ scrollable: true });
        }
        this.setState({ scrollable: false });
    }

    copy(item, type) {
        const { t } = this.props;

        const types = {
            bundle: [t('bundleHashCopied'), t('bundleHashCopiedExplanation')],
            address: [t('addressCopied'), t('addressCopiedExplanation')],
            message: [t('messageCopied'), t('messageCopiedExplanation')],
        };

        Clipboard.setString(item);

        if (types[type]) {
            this.props.generateAlert('success', ...types[type]);
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
                scrollEnabled={false}
            />
        );
    }

    renderButton(buttonProps) {
        const { disableWhen, style, bundle, t, promote } = this.props;
        const opacity = { opacity: disableWhen ? (isAndroid ? 0.3 : 0.2) : 1 };

        const defaultProps = {
            ctaColor: style.primaryColor,
            secondaryCtaColor: style.primaryBody,
            ctaWidth: width / 2.75,
            ctaHeight: height / 17,
            fontSize: GENERAL.fontSize2,
            text: t('retry'),
            onPress: () => {
                if (!disableWhen) {
                    promote(bundle);
                }
            },
        };

        const props = assign({}, defaultProps, buttonProps);

        return (
            <View style={[styles.buttonContainer, opacity]}>
                <CtaButton {...props} />
            </View>
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
            disableWhen,
            isBroadcastingBundle,
            retryFailedTransaction,
            isRetryingFailedTransaction,
            currentlyPromotingBundleHash,
            isFailedTransaction,
        } = this.props;
        const { scrollable } = this.state;
        const bundleIsBeingPromoted = currentlyPromotingBundleHash === bundle && !confirmationBool;
        const isFailed = isFailedTransaction(bundle);

        return (
            <TouchableWithoutFeedback style={styles.container} onPress={onPress}>
                <View style={styles.wrapper}>
                    <View style={[styles.content, style.borderColor, { backgroundColor: style.backgroundColor }]}>
                        <ScrollView scrollEnabled={scrollable} onContentSizeChange={(x, y) => this.setScrollable(y)}>
                            <TouchableWithoutFeedback style={{ flex: 1 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.statusWrapper}>
                                        <Text style={[styles.statusText, { color: style.titleColor }]}>
                                            {status} {value} {unit}
                                        </Text>
                                        <View style={styles.confirmationWrapper}>
                                            <Text style={[styles.confirmation, { color: style.titleColor }]}>
                                                {confirmation}
                                            </Text>
                                            <Text style={[styles.timestamp, style.defaultTextColor]}>
                                                {formatModalTime(locale, convertUnixTimeToJSDate(time))}
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
                                    <TouchableOpacity onPress={() => this.copy(message, 'message')}>
                                        <Text style={[styles.text, style.defaultTextColor]}>{message}</Text>
                                    </TouchableOpacity>
                                    {(!confirmationBool &&
                                        mode === 'Expert' &&
                                        !isFailed && (
                                            <View style={[styles.buttonsContainer]}>
                                                {(!bundleIsBeingPromoted && this.renderButton()) || (
                                                    <View style={styles.buttonContainer}>
                                                        <ActivityIndicator color={style.secondaryColor} size="large" />
                                                    </View>
                                                )}
                                                {(!isBroadcastingBundle &&
                                                    this.renderButton({
                                                        ctaColor: style.secondaryColor,
                                                        secondaryCtaColor: style.secondaryBody,
                                                        text: t('rebroadcast'),
                                                        onPress: () => {
                                                            if (!disableWhen) {
                                                                rebroadcast(bundle);
                                                            }
                                                        },
                                                    })) || (
                                                    <View style={styles.buttonContainer}>
                                                        <ActivityIndicator color={style.secondaryColor} size="large" />
                                                    </View>
                                                )}
                                            </View>
                                        )) ||
                                        (!confirmationBool &&
                                            mode === 'Standard' &&
                                            !isFailed && (
                                                <View style={[styles.buttonsContainer]}>
                                                    {(!bundleIsBeingPromoted &&
                                                        this.renderButton({ ctaWidth: width / 1.3 })) || (
                                                        <View style={styles.buttonContainer}>
                                                            <ActivityIndicator
                                                                color={style.secondaryColor}
                                                                size="large"
                                                            />
                                                        </View>
                                                    )}
                                                </View>
                                            )) ||
                                        (isFailed && (
                                            <View style={[styles.buttonsContainer]}>
                                                {(!isRetryingFailedTransaction &&
                                                    this.renderButton({
                                                        ctaWidth: width / 1.3,
                                                        onPress: () => {
                                                            if (!disableWhen) {
                                                                retryFailedTransaction(bundle);
                                                            }
                                                        },
                                                    })) || (
                                                    <View style={styles.buttonContainer}>
                                                        <ActivityIndicator color={style.secondaryColor} size="large" />
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                    <StatefulDropdownAlert backgroundColor={style.barBg} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
