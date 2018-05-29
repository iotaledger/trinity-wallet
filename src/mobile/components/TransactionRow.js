import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import spinner from 'iota-wallet-shared-modules/animations/spinner.json';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: GENERAL.borderRadius,
        paddingVertical: height / 55,
        paddingHorizontal: width / 25,
        width: width / 1.2,
        justifyContent: 'center',
        marginBottom: height / 60,
    },
    topWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    textWrapper: {
        flex: 4,
        height: height / 15,
        marginLeft: width / 35,
    },
    innerWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    messageOuterWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    messageInnerWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    timeWrapper: {
        flex: 1,
        alignItems: 'flex-end',
    },
    statusWrapper: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    statusText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: width / 28,
    },
    message: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 28,
    },
    messageTitle: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: width / 28,
        paddingRight: width / 70,
    },
    confirmationStatus: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: width / 28,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 28,
    },
    animation: {
        width: width / 14,
        height: width / 17,
    },
    icon: {
        fontSize: width / 13,
        fontFamily: 'SourceSansPro-Light',
        backgroundColor: 'transparent',
    },
    iconContainer: {
        borderRadius: width / 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 16,
        height: width / 16,
    },
});

export default class TransactionRow extends PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Transaction confirmation state */
        confirmation: PropTypes.string.isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Transaction unit */
        unit: PropTypes.string.isRequired,
        /** Transaction time */
        time: PropTypes.number.isRequired,
        /** Transaction message */
        message: PropTypes.string,
        /** Content styles */
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string.isRequired }).isRequired,
            rowTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            barColor: PropTypes.string.isRequired,
            barBg: PropTypes.string.isRequired,
        }).isRequired,
        /** Container element press event callback function */
        onPress: PropTypes.func.isRequired,
        /** Determines whether bundle is currently being promoted */
        bundleIsBeingPromoted: PropTypes.bool.isRequired,
        /** Icon symbol */
        icon: PropTypes.string.isRequired,
        /** Determines whether a transaction is incoming or outgoing */
        incoming: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        message: 'Empty',
    };

    render() {
        const {
            incoming,
            icon,
            confirmation,
            value,
            unit,
            time,
            message,
            t,
            style,
            onPress,
            bundleIsBeingPromoted,
        } = this.props;

        return (
            <TouchableOpacity onPress={() => onPress(this.props)}>
                <View style={styles.topWrapper}>
                    <View style={[styles.container, style.containerBackgroundColor]}>
                        {bundleIsBeingPromoted && (
                            <View style={{ position: 'absolute', left: width / 3.4, top: height / 70 }}>
                                <LottieView
                                    source={spinner}
                                    style={styles.animation}
                                    autoPlay
                                    loop
                                    ref={(animation) => {
                                        if (animation) {
                                            animation.play();
                                        }
                                    }}
                                />
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.iconContainer, style.rowBorderColor]}>
                                <Text
                                    style={[
                                        styles.icon,
                                        {
                                            color: style.titleColor,
                                            paddingBottom: incoming ? (isAndroid ? 0.5 : 1.5) : isAndroid ? 4 : 5.5,
                                        },
                                    ]}
                                >
                                    {icon}
                                </Text>
                            </View>
                            <View style={styles.textWrapper}>
                                <View style={styles.innerWrapper}>
                                    <View style={styles.statusWrapper}>
                                        <Text style={[styles.statusText, { color: style.titleColor }]}>
                                            {bundleIsBeingPromoted ? 'RETRYING' : confirmation.toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.confirmationStatus, { color: style.titleColor }]}>
                                        {value} {unit}
                                    </Text>
                                </View>
                                <View style={styles.messageOuterWrapper}>
                                    <View style={styles.messageInnerWrapper}>
                                        <Text style={[styles.messageTitle, style.rowTextColor]}>
                                            {t('send:message')}:
                                        </Text>
                                        <Text style={[styles.message, style.rowTextColor]} numberOfLines={1}>
                                            {message}
                                        </Text>
                                    </View>
                                    <View style={styles.timeWrapper}>
                                        <Text style={[styles.timestamp, style.rowTextColor]}>
                                            {formatTime(convertUnixTimeToJSDate(time))}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
