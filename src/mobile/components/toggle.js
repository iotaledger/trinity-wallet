import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { width } from '../util/dimensions';

const styles = StyleSheet.create({
    toggle: {
        width: width / 13,
        height: width / 22,
        borderWidth: 1.5,
        borderRadius: width / 30,
        paddingHorizontal: width / 300,
        justifyContent: 'center',
    },
    toggleContainer: {
        width: width / 12,
        height: width / 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleCircle: {
        width: width / 33,
        height: width / 33,
        borderRadius: width / 33,
    },
});

class Toggle extends React.Component {
    static propTypes = {
        bodyColor: PropTypes.string.isRequired,
        primaryColor: PropTypes.string.isRequired,
        active: PropTypes.bool.isRequired,
    };

    render() {
        const {
            active,
            primaryColor,
            bodyColor
        } = this.props;

        return (
            <View style={styles.toggleContainer}>
                <View style={[ styles.toggle, { alignItems: active ? 'flex-end' : 'flex-start', borderColor: bodyColor } ]}>
                    <View style={[ styles.toggleCircle, { backgroundColor: primaryColor} ]}/>
                </View>
            </View>
        );
    }
}

export default Toggle;
