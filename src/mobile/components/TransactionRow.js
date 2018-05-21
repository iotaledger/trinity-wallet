import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import spinner from 'iota-wallet-shared-modules/animations/spinner.json';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: height / 60,
        paddingHorizontal: width / 30,
        borderWidth: 0.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 1.2,
        height: height / 10,
        justifyContent: 'center',
        marginBottom: height / 60,
    },
    topWrapper: {
        flex: 1,
        alignItems: 'center',
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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
    },
    message: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize2,
    },
    messageTitle: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize2,
        paddingRight: width / 70,
    },
    confirmationStatus: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
    },
    animation: {
        width: width / 14,
        height: width / 17,
    },
});

export default class TransactionRow extends PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Transaction incoming/outgoing state */
        status: PropTypes.string.isRequired,
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
            containerBorderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string.isRequired }).isRequired,
            confirmationStatusColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            barColor: PropTypes.string.isRequired,
            barBg: PropTypes.string.isRequired,
        }).isRequired,
        /** Container element press event callback function */
        onPress: PropTypes.func.isRequired,
        /** Determines whether bundle is currently being promoted */
        bundleIsBeingPromoted: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        message: 'Empty',
    };

    render() {
        const {
            status,
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
                    <View style={[styles.container, style.containerBorderColor, style.containerBackgroundColor]}>
                        {bundleIsBeingPromoted && (
                            <View style={{ position: 'absolute', right: width / 6.8, top: height / 90 }}>
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
                        <View style={styles.innerWrapper}>
                            <View style={styles.statusWrapper}>
                                <Text style={[styles.statusText, { color: style.titleColor }]}>
                                    {status} {value} {unit}
                                </Text>
                            </View>
                            <Text style={[styles.confirmationStatus, style.confirmationStatusColor]}>
                                {bundleIsBeingPromoted ? 'Retrying' : confirmation}
                            </Text>
                        </View>
                        <View style={styles.messageOuterWrapper}>
                            <View style={styles.messageInnerWrapper}>
                                <Text style={[styles.messageTitle, style.defaultTextColor]}>{t('send:message')}:</Text>
                                <Text style={[styles.message, style.defaultTextColor]} numberOfLines={1}>
                                    {message}
                                </Text>
                            </View>
                            <View style={styles.timeWrapper}>
                                <Text style={[styles.timestamp, style.defaultTextColor]}>
                                    {formatTime(convertUnixTimeToJSDate(time))}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
