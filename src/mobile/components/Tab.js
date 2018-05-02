import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Icon } from '../theme/icons.js';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    button: {
        flex: 1,
        width: width / 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: 'transparent',
        borderTopWidth: parseInt(height / 100),
    },
    iconTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 80,
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
    },
});

class Tab extends PureComponent {
    static propTypes = {
        /** Tab icon name */
        icon: PropTypes.string.isRequired,
        /** Tab text color */
        textColor: PropTypes.object.isRequired,
        /** Tab text */
        text: PropTypes.string.isRequired,
        /** Tab icon color */
        iconColor: PropTypes.string.isRequired,
        /** Color for active tab */
        activeColor: PropTypes.string.isRequired,
        /** Border color for active tab */
        activeBorderColor: PropTypes.string.isRequired,
        /** Determines whether the tab is active or not */
        isActive: PropTypes.bool.isRequired,
        /** Press event callback function */
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
                            ? [styles.button, { backgroundColor: activeColor, borderTopColor: activeBorderColor }]
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
