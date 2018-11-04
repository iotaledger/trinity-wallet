import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'shared-modules/libs/date';
import { width, height } from 'libs/dimensions';
import { locale, timezone } from 'libs/device';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: height / 40,
        alignItems: 'center',
        width: Styling.contentWidth,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
    },
    icon: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        backgroundColor: 'transparent',
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
                            size={width / 30}
                            color={style.titleColor}
                            iconStyle={{ position: 'absolute' }}
                        />
                    </View>
                </View>
                <View style={{ flex: 3.2, alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text style={[styles.text, { color: style.defaultTextColor }]}>
                        {formatTime(locale, timezone, convertUnixTimeToJSDate(time))}
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
