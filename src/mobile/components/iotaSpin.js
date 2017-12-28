import React, { Component } from 'react';
import { Animated, Easing } from 'react-native';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';

export default class IotaSpin extends Component {
    constructor() {
        super();

        this.state = {
            spin: new Animated.Value(0),
            scale: new Animated.Value(0),
            ease: Easing.bezier(0.77, 0, 0.175, 1),
        };
    }

    componentDidMount() {
        this.animateIn();
    }

    animateIn() {
        const { duration } = this.props;

        this.state.spin.setValue(0);
        this.state.scale.setValue(0);

        Animated.parallel([
            Animated.timing(this.state.spin, {
                toValue: 1,
                duration: duration,
                easing: this.state.ease,
            }),
            Animated.timing(this.state.scale, {
                toValue: 1,
                duration: duration,
                easing: this.state.ease,
            }),
        ]).start(() => this.animateOut());
    }

    animateOut() {
        const { duration } = this.props;
        Animated.parallel([
            Animated.timing(this.state.spin, {
                toValue: 0,
                duration: duration,
                easing: this.state.ease,
            }),
            Animated.timing(this.state.scale, {
                toValue: 0,
                duration: duration,
                easing: this.state.ease,
            }),
        ]).start(() => this.animateIn());
    }

    render() {
        const spin = this.state.spin.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '1440deg'],
        });
        const scale = this.state.scale.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.4],
        });

        return (
            <Animated.Image
                style={{
                    transform: [{ scale: scale }, { rotate: spin }],
                }}
                source={iotaGlowImagePath}
            />
        );
    }
}
