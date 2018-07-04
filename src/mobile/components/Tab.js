import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Icon } from '../theme/icons.js';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    button: {
        flex: 1,
        width: width / 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: 'transparent',
        borderTopWidth: parseInt(height / 160),
    },
    iconTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 80,
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize1,
        backgroundColor: 'transparent',
    },
});

class Tab extends PureComponent {
    static propTypes = {
        /** Tab icon name */
        icon: PropTypes.string.isRequired,
        /** Tab text */
        text: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
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
        const { onPress, icon, text, theme: { bar, primary }, isActive } = this.props;

        return (
            <TouchableWithoutFeedback onPress={onPress}>
                <View
                    style={
                        isActive
                            ? [styles.button, { backgroundColor: bar.alt, borderTopColor: primary.color }]
                            : styles.button
                    }
                >
                    <Icon name={icon} size={width / 18} color={bar.color} />
                    <Text numberOfLines={1} style={[styles.iconTitle, { color: bar.color }]}>
                        {text}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Tab;
