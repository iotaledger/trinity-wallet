import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Icon } from 'ui/theme/icons';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { isIPhoneX } from 'libs/device';

const styles = StyleSheet.create({
    container: {
        height: width / 8.5,
        width: width / 5,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
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
        fontFamily: 'SourceSansPro-Regular',
        backgroundColor: 'transparent',
    },
});

class Tab extends Component {
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

    constructor(props) {
        super(props);
        this.iconSize = new Animated.Value(props.isActive ? width / 14 : width / 18);
        this.fontSize = new Animated.Value(props.isActive ? width / 42 : Styling.fontSize1);
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.isActive && newProps.isActive) {
            Animated.parallel([
                Animated.timing(this.iconSize, {
                    toValue: width / 14,
                    duration: 150,
                }),
                Animated.timing(this.fontSize, {
                    toValue: width / 42,
                    duration: 150,
                }),
            ]).start();
        }
        if (this.props.isActive && !newProps.isActive) {
            Animated.parallel([
                Animated.timing(this.iconSize, {
                    toValue: width / 18,
                    duration: 150,
                }),
                Animated.timing(this.fontSize, {
                    toValue: Styling.fontSize1,
                    duration: 150,
                }),
            ]).start();
        }
    }

    getPosition() {
        const { name } = this.props;
        const names = ['balance', 'send', 'receive', 'history', 'settings'];
        return names.indexOf(name) * width / 5;
    }

    render() {
        const { onPress, icon, text, theme: { bar } } = this.props;
        const AnimatedIcon = Animated.createAnimatedComponent(Icon);
        AnimatedIcon.displayName = 'AnimatedIcon';

        return (
            <TouchableWithoutFeedback onPress={onPress}>
                <View style={[{ position: 'absolute', left: this.getPosition() }, styles.button]}>
                    <View style={styles.container}>
                        <AnimatedIcon
                            name={icon}
                            color={bar.color}
                            style={[{ backgroundColor: 'transparent', fontSize: this.iconSize }]}
                        />
                        <Animated.Text
                            numberOfLines={1}
                            style={[styles.iconTitle, { color: bar.color, fontSize: this.fontSize }]}
                        >
                            {text}
                        </Animated.Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default Tab;
