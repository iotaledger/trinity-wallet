import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        width,
        flexDirection: 'row',
        height: height / 40,
        alignItems: 'center',
        paddingHorizontal: width / 10,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 32,
    },
});

export default class SimpleTransactionRow extends PureComponent {
    static propTypes = {
        time: PropTypes.number.isRequired,
        confirmationStatus: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        sign: PropTypes.string.isRequired,
        incoming: PropTypes.bool.isRequired,
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
        }).isRequired,
    };

    render() {
        const { time, confirmationStatus, value, unit, sign, incoming, style } = this.props;

        return (
            <View style={styles.container}>
                <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
                    <Icon name={incoming ? 'receive' : 'send'} size={width / 28} color={style.iconColor} />
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
