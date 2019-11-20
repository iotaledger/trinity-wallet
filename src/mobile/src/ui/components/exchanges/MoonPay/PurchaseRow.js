import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { formatTime } from 'shared-modules/libs/date';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { locale, timezone } from 'libs/device';
import Icon from 'ui/theme/icons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    row: {
        flex: 1,
        borderRadius: Styling.borderRadius,
        paddingVertical: height / 55,
        width: Styling.contentWidth,
        justifyContent: 'center',
        marginBottom: height / 60,
        height: height / 10,
    },
    innerRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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

/** MoonPay purchase history row item */
export default class PurchaseRow extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Purchase confirmation state */
        status: PropTypes.string.isRequired,
        /** Purchase confirmation status text */
        statusText: PropTypes.string.isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Transaction unit */
        unit: PropTypes.string.isRequired,
        /** Transaction time */
        time: PropTypes.string.isRequired,
        /** Content styles */
        style: PropTypes.shape({
            backgroundColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            titleColor: PropTypes.string.isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string.isRequired }).isRequired,
            rowTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            primaryColor: PropTypes.string.isRequired,
            failedColor: PropTypes.string.isRequired,
        }).isRequired,
        /** Container element press event callback function */
        onPress: PropTypes.func.isRequired,
    };

    getOpacity() {
        const { status } = this.props;
        return status === 'pending' || status === 'waitingAuthorization' ? 0.55 : 1;
    }

    render() {
        const { status, statusText, value, unit, time, t, style, onPress } = this.props;

        return (
            <TouchableOpacity onPress={() => onPress(this.props)}>
                <View style={[ styles.container, { opacity: this.getOpacity() } ]}>
                    <View style={[styles.row, style.containerBackgroundColor]}>
                        <View style={styles.innerRowContainer}>
                            <View style={styles.iconWrapper}>
                                <Icon
                                    name="moonpayEmblem"
                                    size={width / 22}
                                    color={style.titleColor}
                                    iconStyle={{ position: 'absolute' }}
                                />
                            </View>
                            <View style={styles.textWrapper}>
                                <View style={styles.topWrapper}>
                                    <Text style={[styles.statusText, { color: status === 'failed' ? style.failedColor : style.titleColor }]}>{statusText}</Text>
                                    <Text style={[styles.confirmationStatus, { color: style.titleColor }]}>
                                        {value} {unit}
                                    </Text>
                                </View>
                                <View style={styles.bottomWrapper}>
                                    <View style={styles.messageWrapper}>
                                        <Text style={[styles.messageTitle, { color: style.primaryColor }]}>
                                            {t('moonpay:moonpayPurchase')}
                                        </Text>
                                    </View>
                                    <View style={styles.timestampWrapper}>
                                        <Text style={[styles.timestamp, style.rowTextColor]}>
                                            {formatTime(locale, timezone, time)}
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
