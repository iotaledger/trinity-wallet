import last from 'lodash/last';
import merge from 'lodash/merge';
import React, { Component } from 'react';
import { Animated, Easing } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { width } from 'libs/dimensions';

class AnimatedComponent extends Component {
    static propTypes = {
        /** Component to animate */
        children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        /** Determines whether to animate in on mount */
        animateOnMount: PropTypes.bool,
        /** Delay for animation trigger */
        delay: PropTypes.number,
        /** Style of animation in */
        animationInType: PropTypes.array,
        /** Style of animation out */
        animationOutType: PropTypes.array,
        /** Duration of animation */
        duration: PropTypes.number,
        /** @ignore */
        navStack: PropTypes.array.isRequired,
        /** Style prop */
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
    };

    static defaultProps = {
        animateOnMount: true,
        delay: 0,
        animationInType: ['fadeIn'],
        animationOutType: ['fadeOut'],
        duration: 300,
        triggerAnimationIn: false,
        triggerAnimationOut: false,
    };

    constructor(props) {
        super(props);
        this.fadeValue = new Animated.Value(1);
        this.slideValue = new Animated.Value(0);
        this.animatedStyle = {};
        // Slide animations are reversed when popping from navigation stack
        this.reverseSlideIn = false;
        this.reverseSlideOut = false;
        this.iniatialiseAnimations(props.animationInType);
        this.screen = last(props.navStack);
    }

    componentDidMount() {
        // Animate in on mount
        if (this.props.animateOnMount) {
            this.animateIn(this.props.delay);
        }
    }

    componentWillReceiveProps(newProps) {
        // Animate out if pushing from current screen
        if (this.props.navStack.length < newProps.navStack.length && this.screen === last(this.props.navStack)) {
            this.reverseSlideOut = false;
            this.iniatialiseAnimations(this.props.animationOutType);
            this.animateOut();
        }
        // Animate out if popping from current screen
        if (
            this.props.navStack.length > newProps.navStack.length &&
            this.screen === last(this.props.navStack) &&
            newProps.navStack.length !== 1
        ) {
            this.reverseSlideOut = true;
            this.iniatialiseAnimations(this.props.animationOutType);
            this.animateOut();
        }

        // Animate out if resetting navigator stack
        if (
            this.screen === last(this.props.navStack) &&
            newProps.navStack.length === 1 &&
            last(this.props.navStack) !== last(newProps.navStack)
        ) {
            this.reverseSlideOut = false;
            this.iniatialiseAnimations(this.props.animationOutType);
            this.animateOut();
        }

        // Animate in if popping to current screen
        if (this.props.navStack.length > newProps.navStack.length && this.screen === last(newProps.navStack)) {
            this.reverseSlideIn = true;
            this.iniatialiseAnimations(this.props.animationInType);
            // Allow time for animate out (300ms)
            this.animateIn(this.props.delay + 300);
        }
    }

    /**
     * Gets animated style object for single or multiple animations
     * @method getAnimatedStyle
     * @param {string}
     * @returns {object}
     */
    getAnimatedStyle(animationType) {
        let animatedStyle = {};
        animationType.map((type) => {
            switch (type) {
                case 'fadeIn':
                    animatedStyle = merge({}, animatedStyle, { opacity: this.fadeValue });
                    break;
                case 'fadeOut':
                    animatedStyle = merge({}, animatedStyle, { opacity: this.fadeValue });
                    break;
                case 'slideInRight':
                    animatedStyle = merge({}, animatedStyle, { width, transform: [{ translateX: this.slideValue }] });
                    break;
                case 'slideOutLeft':
                    animatedStyle = merge({}, animatedStyle, { width, transform: [{ translateX: this.slideValue }] });
                    break;
            }
        });
        return animatedStyle;
    }

    /**
     * Gets starting animated value
     * @method getStartingAnimatedValue
     * @param {string}
     * @returns {number}
     */
    getStartingAnimatedValue(animationType) {
        switch (animationType) {
            case 'fadeIn':
                return 0;
            case 'fadeOut':
                return 1;
            case 'slideInRight':
                return this.reverseSlideIn ? -width : width;
            case 'slideOutLeft':
                return 0;
        }
    }

    /**
     * Gets final animated value
     * @method getFinalAnimatedValue
     * @param {string}
     * @returns {number}
     */
    getFinalAnimatedValue(animationType) {
        switch (animationType) {
            case 'fadeIn':
                return 1;
            case 'fadeOut':
                return 0;
            case 'slideInRight':
                return 0;
            case 'slideOutLeft':
                return this.reverseSlideOut ? width : -width;
        }
    }

    /**
     * Gets easing function
     * @method getEasing
     * @param {string}
     * @returns {function}
     */
    getEasing(animationType) {
        switch (animationType) {
            case 'fadeIn':
                return Easing.ease;
            case 'fadeOut':
                return Easing.ease;
            case 'slideOutLeft':
                return Easing.bezier(0.25, 1, 0.25, 1);
            case 'slideInRight':
                return Easing.bezier(0.25, 1, 0.25, 1);
        }
    }

    /**
     * Gets variable pointer for each animation type
     * @method getAnimation
     * @param {string}
     * @returns {number}
     */
    getAnimationPointer(animationType) {
        switch (animationType) {
            case 'fadeIn':
                return this.fadeValue;
            case 'fadeOut':
                return this.fadeValue;
            case 'slideInRight':
                return this.slideValue;
            case 'slideOutLeft':
                return this.slideValue;
        }
    }

    /**
     * Creates animation and gets relevant values
     * @method getAnimation
     * @param {string}
     * @param {number}
     * @returns {array}
     */
    getAnimation(animationType, delay = 0) {
        const animations = [];
        animationType.map((type) => {
            animations.push(
                Animated.timing(this.getAnimationPointer(type), {
                    toValue: this.getFinalAnimatedValue(type),
                    duration: type === 'fadeOut' ? 100 : this.props.duration,
                    delay,
                    easing: this.getEasing(type),
                }),
            );
        });
        return animations;
    }

    /**
     * Assigns animated values to pointers and initialises animation style
     * @method iniatialiseAnimations
     * @param {string}
     */
    iniatialiseAnimations(animationType) {
        animationType.map((type) => {
            switch (type) {
                case 'fadeIn':
                    this.fadeValue = new Animated.Value(this.getStartingAnimatedValue(type));
                    break;
                case 'fadeOut':
                    this.fadeValue = new Animated.Value(this.getStartingAnimatedValue(type));
                    break;
                case 'slideInRight':
                    this.slideValue = new Animated.Value(this.getStartingAnimatedValue(type));
                    break;
                case 'slideOutLeft':
                    this.slideValue = new Animated.Value(this.getStartingAnimatedValue(type));
                    break;
            }
        });
        this.animatedStyle = this.getAnimatedStyle(animationType);
    }

    /**
     * Animate in on page transition
     * @method animateIn
     * @param {number}
     */
    animateIn(delay = this.props.delay) {
        Animated.parallel(this.getAnimation(this.props.animationInType, delay)).start();
    }

    /**
     * Animate out on page transition
     * @method animateOut
     */
    animateOut() {
        Animated.parallel(this.getAnimation(this.props.animationOutType)).start();
    }

    render() {
        const { children, style } = this.props;
        return (
            <Animated.View style={[this.animatedStyle, style ? style : { alignItems: 'center' }]}>
                {children}
            </Animated.View>
        );
    }
}

const mapStateToProps = (state) => ({
    navStack: state.wallet.navStack,
});

export default connect(mapStateToProps)(AnimatedComponent);
