import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Icon } from 'ui/theme/icons';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { isIPhoneX } from 'libs/device';

const styles = StyleSheet.create({
    button: {
        width: width / 5,
        height: parseInt(width / 5 + height / (isIPhoneX ? 120 : 160)),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: 'transparent',
        borderTopWidth: parseInt(height / (isIPhoneX ? 120 : 160)),
    },
    iconTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: height / 80,
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize1,
        backgroundColor: 'transparent',
    },
});

class Tab extends PureComponent {
    static propTypes = {
        /** Tab icon name */
        icon: PropTypes.string.isRequired,
        /** Tab text */
        text: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Determines whether the tab is active or not */
        isActive: PropTypes.bool.isRequired,
        /** Press event callback function */
        onPress: PropTypes.func,
        /** Tab name */
        name: PropTypes.string.isRequired,
    };

    static defaultProps = {
        onPress: () => {},
        isActive: false,
    };

    getPosition() {
        const { name } = this.props;
        const names = ['balance', 'send', 'receive', 'history', 'settings'];
        return names.indexOf(name) * width / 5;
    }

    render() {
        const { onPress, icon, text, theme: { bar, primary }, isActive } = this.props;

        return (
            <TouchableWithoutFeedback onPress={onPress}>
                <View
                    style={[
                        { position: 'absolute', left: this.getPosition() },
                        isActive
                            ? [
                                  styles.button,
                                  {
                                      backgroundColor: bar.hover,
                                      borderTopColor: primary.color,
                                      borderRadius: isIPhoneX ? Styling.borderRadius : 0,
                                  },
                              ]
                            : styles.button,
                    ]}
                >
                    <Icon name={icon} size={width / 18} color={bar.color} style={{ backgroundColor: 'transparent' }} />
                    <Text numberOfLines={1} style={[styles.iconTitle, { color: bar.color }]}>
                        {text}
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Tab;
