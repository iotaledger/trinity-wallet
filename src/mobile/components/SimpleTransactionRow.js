import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';

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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
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
        /** Determines whether a transaction is incoming or outgoing */
        incoming: PropTypes.bool.isRequired,
        /** TransactionRow styles */
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
        }).isRequired,
        sign: PropTypes.string.isRequired,
    };

    render() {
        const { time, confirmationStatus, value, unit, sign, incoming, style } = this.props;

        return (
            <View style={styles.container}>
                <View style={{ flex: 0.8, alignItems: 'flex-start' }}>
                    <Icon name={incoming ? 'receive' : 'send'} size={width / 30} color={style.iconColor} />
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
