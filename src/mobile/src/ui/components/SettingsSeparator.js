import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PropTypes from 'prop-types';
import { width } from 'libs/dimensions';

const styles = StyleSheet.create({
    separator: {
        borderBottomWidth: 0.5,
        width: width / 1.16,
        alignSelf: 'center',
    },
    separatorContainer: {
        flex: 1,
        justifyContent: 'center',
    },
});

class SettingsSeparator extends PureComponent {
    static propTypes = {
        /** @ignore */
        color: PropTypes.string.isRequired,
        /** @ignore */
        inactive: PropTypes.bool,
        /** Component height */
        height: PropTypes.number,
    };

    static defaultProps = {
        inactive: false,
    };

    render() {
        const { color, inactive, height } = this.props;

        return (
            <TouchableWithoutFeedback>
                <View style={[styles.separatorContainer, {height}, inactive && { opacity: 0.35 }]}>
                    <View style={[styles.separator, { borderBottomColor: color }]} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default SettingsSeparator;
