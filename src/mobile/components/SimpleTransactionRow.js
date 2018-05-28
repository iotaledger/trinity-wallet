import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/date';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import { isAndroid } from '../utils/device';

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
    iconContainer: {
        borderRadius: width / 30,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 24,
        height: width / 24

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
        /** Sign for value */
        sign: PropTypes.string.isRequired,
        /** Icon symbol */
        icon: PropTypes.string.isRequired,
    };

    render() {
        const { time, confirmationStatus, value, unit, sign, style, incoming, icon } = this.props;
        return (
            <View style={styles.container}>
                <View style={{ flex: 0.6, alignItems: 'flex-start' }}>
                    <View style={[ styles.iconContainer, { borderColor: style.defaultTextColor } ]}>
                        <Text style={[ styles.icon, { color: style.titleColor, marginBottom: incoming ? isAndroid ? 0 : 1 : isAndroid ? 2 : 2.5, marginLeft: incoming ? isAndroid ? 0 : 0.5 : 0 } ]}>{icon}</Text>
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
