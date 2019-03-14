import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { formatTime, convertUnixTimeToJSDate } from 'shared-modules/libs/date';
import spinner from 'shared-modules/animations/spinner.json';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { locale, timezone } from 'libs/device';
import { Icon } from 'ui/theme/icons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    row: {
        flex: 1,
        borderRadius: Styling.borderRadius,
        borderWidth: 1,
        paddingVertical: height / 55,
        width: Styling.contentWidth,
        justifyContent: 'center',
        marginBottom: height / 60,
        height: height / 10,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: width / 32,
        width: width / 20,
    },
    textWrapper: {
        flex: 1,
        height: height / 15,
        marginRight: width / 32,
    },
    topWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bottomWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    statusText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: width / 28,
    },
    message: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 28,
        flex: 1,
        paddingRight: width / 70,
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
    messageWrapper: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    timestampWrapper: {
        flex: 1,
        alignItems: 'flex-end',
    },
});

export default class TransactionRow extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Transaction confirmation state */
        status: PropTypes.string.isRequired,
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
    };

    static defaultProps = {
        message: 'Empty',
    };

    constructor() {
        super();
        this.state = {
            statusTextWidth: 0,
        };
    }

    render() {
        const { icon, status, value, unit, time, message, t, style, onPress, bundleIsBeingPromoted } = this.props;

        return (
            <TouchableOpacity onPress={() => onPress(this.props)}>
                <View style={styles.container}>
                    <View style={[styles.row, style.containerBackgroundColor, style.rowBorderColor]}>
                        {bundleIsBeingPromoted && (
                            <View
                                style={{
                                    position: 'absolute',
                                    left: this.state.statusTextWidth + width / 8,
                                    top: height / 85,
                                }}
                            >
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
                            <View style={styles.iconWrapper}>
                                <Icon
                                    name={icon}
                                    size={width / 22}
                                    color={style.titleColor}
                                    iconStyle={{ position: 'absolute' }}
                                />
                            </View>
                            <View style={styles.textWrapper}>
                                <View style={styles.topWrapper}>
                                    <Text
                                        style={[styles.statusText, { color: style.titleColor }]}
                                        onLayout={(event) =>
                                            this.setState({ statusTextWidth: event.nativeEvent.layout.width })
                                        }
                                    >
                                        {bundleIsBeingPromoted ? t('history:retrying') : status}
                                    </Text>
                                    <Text style={[styles.confirmationStatus, { color: style.titleColor }]}>
                                        {value} {unit}
                                    </Text>
                                </View>
                                <View style={styles.bottomWrapper}>
                                    <View style={styles.messageWrapper}>
                                        <Text style={[styles.messageTitle, style.rowTextColor]}>
                                            {t('send:message')}:
                                        </Text>
                                        <Text style={[styles.message, style.rowTextColor]} numberOfLines={1}>
                                            {message === 'Empty' ? t('history:empty') : message}
                                        </Text>
                                    </View>
                                    <View style={styles.timestampWrapper}>
                                        <Text style={[styles.timestamp, style.rowTextColor]}>
                                            {formatTime(locale, timezone, convertUnixTimeToJSDate(time))}
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
