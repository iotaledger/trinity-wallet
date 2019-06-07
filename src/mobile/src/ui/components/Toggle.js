import React, { PureComponent } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import { width } from 'libs/dimensions';
import { isAndroid } from 'libs/device';

const styles = StyleSheet.create({
    toggle: {
        borderWidth: 1.5,
        justifyContent: 'center',
    },
    toggleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleCircle: {},
});

class Toggle extends PureComponent {
    static propTypes = {
        /** Determines whether the toggle is active or not */
        active: PropTypes.bool.isRequired,
        /** @ignore */
        bodyColor: PropTypes.string.isRequired,
        /** @ignore */
        primaryColor: PropTypes.string.isRequired,
        /** Toggle scale multiplier */
        scale: PropTypes.number,
        /** Toggle opacity */
        opacity: PropTypes.number,
    };

    static defaultProps = {
        scale: 1,
        opacity: 1,
    };

    constructor(props) {
        super(props);
        this.state = {
            togglePosition: new Animated.Value(this.getTogglePosition(props.active)),
            toggleStyle: this.getToggleStyle(),
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.active !== newProps.active) {
            Animated.timing(this.state.togglePosition, {
                toValue: this.getTogglePosition(!this.props.active),
                duration: 80,
            }).start(() => this.setState({ toggleStyle: this.getToggleStyle() }));
        }
    }

    /**
     * Gets toggle style depending on whether it is active
     *
     * @returns {object}
     */
    getToggleStyle() {
        const { active, scale, primaryColor, bodyColor } = this.props;
        if (active) {
            return { backgroundColor: primaryColor, borderWidth: 0 };
        }
        return { backgroundColor: 'transparent', borderWidth: scale * 1.5, borderColor: bodyColor };
    }

    /**
     * Gets toggle position depending on the given condition
     *
     * @param {bool} condition
     * @returns {object}
     */
    getTogglePosition(condition) {
        const size = width * this.props.scale;
        return condition ? size / 12 - size / 33 - 5 : 1.5;
    }

    render() {
        const { bodyColor, scale, opacity } = this.props;
        const size = width * scale;
        return (
            <View style={[styles.toggleContainer, { width: size / 12, height: size / 12 }]}>
                <View
                    style={[
                        styles.toggle,
                        {
                            borderColor: bodyColor,
                            width: size / 12,
                            height: size / 22,
                            borderRadius: size / 24,
                            opacity: isAndroid ? opacity * 2 : 1,
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.toggleCircle,
                            {
                                width: size / 33,
                                height: size / 33,
                                borderRadius: size / 33,
                                position: 'absolute',
                                left: this.state.togglePosition,
                            },
                            this.state.toggleStyle,
                        ]}
                    />
                </View>
            </View>
        );
    }
}

export default Toggle;
