import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, Image } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        width,
        flexDirection: 'row',
        height: height / 40,
        alignItems: 'center',
        paddingHorizontal: width / 10,
    },
    icon: {
        width: width / 35,
        height: width / 35,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 32,
        fontWeight: '400',
    },
});

export default class SimpleTransactionRow extends PureComponent {
    static propTypes = {
        time: PropTypes.number.isRequired,
        confirmationStatus: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        sign: PropTypes.string.isRequired,
        iconPath: PropTypes.number.isRequired,
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
        }).isRequired,
    };

    render() {
        const { time, confirmationStatus, value, unit, sign, iconPath, style } = this.props;

        return (
            <View style={styles.container}>
                <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
                    <Image source={iconPath} style={styles.icon} />
                </View>
                <View style={{ flex: 3, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, style.defaultTextColor, { padding: 5 }]}>
                        {formatTime(convertUnixTimeToJSDate(time))}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, style.defaultTextColor]}>{confirmationStatus}</Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-end' }}>
                    <Text style={[styles.text, { color: style.titleColor }]}>
                        {sign} {value} {unit}
                    </Text>
                </View>
            </View>
        );
    }
}
