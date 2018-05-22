import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

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
        position: 'absolute',
    },
    iconContainer: {
        borderRadius: width / 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: width / 60
    }
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
            defaultTextColor: PropTypes.string.isRequired,
        }).isRequired,
        sign: PropTypes.string.isRequired,
    };

    render() {
        const { time, confirmationStatus, value, unit, sign, style, incoming } = this.props;
        return (
            <View style={styles.container}>
                <View style={{ flex: 0.6, alignItems: 'flex-start' }}>
                    <View style={[ styles.iconContainer, { borderColor: style.defaultTextColor } ]}>
                        <Text style={[ styles.icon, { color: style.titleColor, bottom: incoming ? -3.2 : -2, left: incoming ? 2.5 : null } ]}>{sign}</Text>
                    </View>
                </View>
                <View style={{ flex: 3.2, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, { color: style.defaultTextColor }, { padding: 5 }]}>
                        {formatTime(convertUnixTimeToJSDate(time))}
                    </Text>
                </View>
                <View style={{ flex: 2, alignItems: 'flex-start' }}>
                    <Text style={[styles.text, { color: style.defaultTextColor } ]}>{confirmationStatus}</Text>
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
