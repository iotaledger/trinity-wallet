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
import { formatModalTime, convertUnixTimeToJSDate } from 'shared-modules/libs/date';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { isAndroid, locale, timezone } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import CtaButton from './CtaButton';

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
        width: Styling.contentWidth,
        padding: width / 25,
        justifyContent: 'center',
        borderRadius: Styling.borderRadius,
        borderWidth: 2,
    },
    statusWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statusText: {
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize3,
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
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize2,
        marginTop: 2,
    },
    bundleSeparator: {
        flex: 1,
    },
    confirmation: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        paddingRight: width / 25,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize3,
    },
    heading: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize2,
        paddingTop: height / 50,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize2,
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
        fontSize: Styling.fontSize3,
        textAlign: 'right',
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: height / 40,
        height: height / 14,
    },
    buttonWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default class HistoryModalContent extends PureComponent {
    static propTypes = {
        /** Container element press event callback function */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Promotes bundle
         * @param {string} bundle - bundle hash
         */
        promote: PropTypes.func.isRequired,
        /** Transaction confirmation state */
        status: PropTypes.string.isRequired,
        /** Transaction boolean confirmation state */
        persistence: PropTypes.bool.isRequired,
        /** Currently selected mode */
        mode: PropTypes.oneOf(['Advanced', 'Standard']).isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Transaction value without rounding */
        fullValue: PropTypes.number.isRequired,
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
        relevantAddresses: PropTypes.arrayOf(
            PropTypes.shape({
                address: PropTypes.string.isRequired,
                value: PropTypes.number.isRequired,
                unit: PropTypes.string.isRequired,
            }),
        ).isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** Content styles */
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
        }).isRequired,
        /** Determines whether bundle is currently being promoted */
        bundleIsBeingPromoted: PropTypes.bool.isRequired,
        /* eslint-disable react/no-unused-prop-types */
        /** Checks if the bundle hash belongs to a failed transaction
         * @param {string} bundleHash
         */
        isFailedTransaction: PropTypes.func.isRequired,
        /** @ignore */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** @ignore */
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

    setScrollable(y, retryButtonIsDisplayed) {
        if (retryButtonIsDisplayed ? y >= height / 2 : y >= height / 2.3) {
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
        const { relevantAddresses } = this.props;
        return (
            <FlatList
                data={relevantAddresses}
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
            ctaHeight: height / 15,
            fontSize: Styling.fontSize3,
            text: disableWhen ? t('history:promotingAnotherBundle') : t('retry'),
            onPress: () => {
                if (!disableWhen) {
                    promote(bundle);
                }
            },
        };

        const props = assign({}, defaultProps, buttonProps);

        return (
            <View style={[styles.buttonWrapper, opacity]}>
                <CtaButton {...props} />
            </View>
        );
    }

    render() {
        const {
            hideModal,
            fullValue,
            unit,
            status,
            persistence,
            time,
            bundle,
            message,
            t,
            style,
            mode,
            disableWhen,
            retryFailedTransaction,
            isRetryingFailedTransaction,
            bundleIsBeingPromoted,
            isFailedTransaction,
        } = this.props;
        const { scrollable } = this.state;
        const isFailed = isFailedTransaction(bundle);
        const retryButtonIsDisplayed = !persistence || isFailed;

        return (
            <TouchableWithoutFeedback style={styles.container} onPress={() => hideModal()}>
                <View style={styles.wrapper}>
                    <View style={[styles.content, style.borderColor, { backgroundColor: style.backgroundColor }]}>
                        <ScrollView scrollEnabled={false}>
                            <TouchableWithoutFeedback style={{ flex: 1 }}>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.statusWrapper}>
                                        <Text style={[styles.statusText, { color: style.titleColor }]}>
                                            {status} {fullValue} {unit}
                                        </Text>
                                        <View style={styles.confirmationWrapper}>
                                            <Text style={[styles.timestamp, style.defaultTextColor]}>
                                                {formatModalTime(locale, timezone, convertUnixTimeToJSDate(time))}
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
                                    {mode === 'Advanced' && (
                                        <View>
                                            <Text style={[styles.heading, style.defaultTextColor]}>
                                                {t('addresses')}:
                                            </Text>
                                            <ScrollView
                                                scrollEnabled={scrollable}
                                                showsVerticalScrollIndicator={scrollable}
                                                style={{
                                                    maxHeight: retryButtonIsDisplayed ? height / 2.3 : height / 2,
                                                }}
                                                onContentSizeChange={(x, y) =>
                                                    this.setScrollable(y, retryButtonIsDisplayed)
                                                }
                                            >
                                                {this.renderAddresses()}
                                            </ScrollView>
                                        </View>
                                    )}
                                    <Text style={[styles.heading, style.defaultTextColor]}>{t('send:message')}:</Text>
                                    <TouchableOpacity onPress={() => this.copy(message, 'message')}>
                                        <Text style={[styles.text, style.defaultTextColor]}>{message}</Text>
                                    </TouchableOpacity>
                                    {(!persistence &&
                                        !isFailed && (
                                            <View style={[styles.buttonContainer]}>
                                                {(!bundleIsBeingPromoted &&
                                                    this.renderButton({ ctaWidth: width / 1.3 })) || (
                                                    <View style={styles.buttonWrapper}>
                                                        <ActivityIndicator color={style.secondaryColor} size="large" />
                                                    </View>
                                                )}
                                            </View>
                                        )) ||
                                        (isFailed && (
                                            <View style={[styles.buttonContainer]}>
                                                {(!isRetryingFailedTransaction &&
                                                    this.renderButton({
                                                        ctaWidth: width / 1.3,
                                                        onPress: () => {
                                                            if (!disableWhen) {
                                                                retryFailedTransaction(bundle);
                                                            }
                                                        },
                                                    })) || (
                                                    <View style={styles.buttonWrapper}>
                                                        <ActivityIndicator color={style.secondaryColor} size="large" />
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                </View>
                            </TouchableWithoutFeedback>
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
