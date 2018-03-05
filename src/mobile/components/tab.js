import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Icon } from '../theme/icons.js';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    button: {
        flex: 1,
        width: width / 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: height / 100,
        borderTopColor: 'transparent',
    },
    iconTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 80,
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
    },
});

/* eslint-disable react/prefer-stateless-function */
class Tab extends Component {
    static propTypes = {
        icon: PropTypes.number.isRequired,
        textColor: PropTypes.object.isRequired,
        text: PropTypes.string.isRequired,
        iconColor: PropTypes.string.isRequired,
        activeColor: PropTypes.string.isRequired,
        activeBorderColor: PropTypes.string.isRequired,
        isActive: PropTypes.bool.isRequired,
        onPress: PropTypes.func,
    };
    static defaultProps = {
        onPress: () => {},
        isActive: false,
    };

    render() {
        const { onPress, icon, iconColor, text, textColor, activeColor, activeBorderColor, isActive } = this.props;

        return (
            <TouchableWithoutFeedback onPress={onPress}>
                <View
                    style={
                        isActive
                            ? [styles.button, { backgroundColor: activeColor }, { borderTopColor: activeBorderColor }]
                            : styles.button
                    }
                >
                    <Icon name={icon} size={width / 18} color={iconColor} />
                    <Text numberOfLines={1} style={[styles.iconTitle, textColor]}>
                        {text}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Tab;
