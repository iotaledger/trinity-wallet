import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import { width, height } from '../utils/dimensions';
import { locale } from '../utils/device';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: height / 40,
        alignItems: 'center',
        width: width / 1.15,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
    },
    icon: {
        fontSize: GENERAL.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        backgroundColor: 'transparent',
    },
    iconBorder: {
        borderRadius: width / 56,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 28,
        height: width / 28,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 28,
    },
});

export default class SimpleTransactionRow extends PureComponent {
    static propTypes = {
        /** Transaction timestamp */
        time: PropTypes.number.isRequired,
        /** Transaction confirmaton status */
        confirmationStatus: PropTypes.string.isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Transaction value unit */
        unit: PropTypes.string.isRequired,
        /** TransactionRow styles */
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.string.isRequired,
        }).isRequired,
        /** Sign for value */
        sign: PropTypes.string.isRequired,
        /** Icon symbol */
        icon: PropTypes.string.isRequired,
    };

    render() {
        const { time, confirmationStatus, value, unit, sign, style, icon } = this.props;
        return (
            <View style={styles.container}>
                <View style={{ flex: 0.6, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <View style={styles.iconContainer}>
                        <Icon
                            name={icon}
                            size={width / 52}
                            color={style.titleColor}
                            iconStyle={{ position: 'absolute' }}
                        />
                        <View
                            style={[styles.iconBorder, { borderColor: style.defaultTextColor, position: 'absolute' }]}
                        />
                    </View>
                </View>
                <View style={{ flex: 3.2, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={[styles.text, { color: style.defaultTextColor }]}>
                        {formatTime(locale, convertUnixTimeToJSDate(time))}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={[styles.text, { color: style.defaultTextColor }]}>{confirmationStatus}</Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Text style={[styles.text, { color: style.titleColor }]}>
                        {sign} {value} {unit}
                    </Text>
                </View>
            </View>
        );
    }
}
