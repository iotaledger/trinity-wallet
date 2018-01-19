import React, { Component } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, Image, View } from 'react-native';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    button: {
        width: width / 5,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    icon: {
        paddingTop: height / 40,
        height: width / 15,
        width: width / 15,
    },
    iconTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 80,
        fontFamily: 'Lato-Regular',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
    },
    fullyOpaque: {
        opacity: 1,
    },
    partiallyOpaque: {
        opacity: 0.4,
    },
});

class Tab extends Component {
    render() {
        const { onPress, name, icon, text, isActive, textColor } = this.props;

        return (
            <TouchableWithoutFeedback onPress={onPress}>
                <View style={styles.button}>
                    <Image
                        style={isActive ? [styles.icon, styles.fullyOpaque] : [styles.icon, styles.partiallyOpaque]}
                        source={icon}
                    />
                    <Text
                        numberOfLines={1}
                        style={
                            isActive
                                ? [styles.iconTitle, styles.fullyOpaque, textColor]
                                : [styles.iconTitle, styles.partiallyOpaque, textColor]
                        }
                    >
                        {text}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Tab;
