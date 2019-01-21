import head from 'lodash/head';
import last from 'lodash/last';
import merge from 'lodash/merge';
import forEach from 'lodash/forEach';
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
        /** Trigger animation out on change */
        animateOutTrigger: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        /** Trigger animation in on change */
        animateInTrigger: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        /** Determines whether to animate with changes to the navigation stack */
        animateOnNavigation: PropTypes.bool,
        /** Screen name */
        screenName: PropTypes.string,
    };

    static defaultProps = {
        animateOnMount: true,
        animateOnNavigation: true,
        delay: 0,
        animationInType: ['fadeIn'],
        animationOutType: ['fadeOut'],
        duration: 300,
        animateInTrigger: false,
        animateOutTrigger: false,
        isDashboard: false,
        blockAnimation: false,
        screenName: null,
    };

    constructor(props) {
        super(props);
        this.fadeValue = new Animated.Value(1);
        this.slideValue = new Animated.Value(0);
        this.animatedStyle = {};
        // Slide animations are reversed when popping from navigation stack
        this.reverseSlideIn = false;
        this.reverseSlideOut = false;
        if (props.animateOnMount) {
            this.iniatialiseAnimations(props.animationInType);
        }
        // screenName is set in case screen remounts and is not last in the nav stack e.g. after Biometric auth request
        this.screen = props.screenName ? props.screenName : last(props.navStack);
    }

    componentWillMount() {
        // Animate in on page mount
        if (this.props.animateOnMount) {
            this.animateIn(this.props.delay);
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.animateInTrigger !== newProps.animateInTrigger) {
            return this.iniatialiseAnimations(newProps.animationInType);
        }

        if (this.props.animateOutTrigger !== newProps.animateOutTrigger) {
            return this.iniatialiseAnimations(newProps.animationOutType);
        }

        if (!this.props.animateOnNavigation) {
            return;
        }

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
            head(this.props.navStack) === head(newProps.navStack)
        ) {
            this.reverseSlideOut = true;
            this.iniatialiseAnimations(this.props.animationOutType);
            this.animateOut();
        }

        // Animate out if resetting navigator stack
        if (
            this.screen === last(this.props.navStack) &&
            newProps.navStack.length === 1 &&
            head(this.props.navStack) !== head(newProps.navStack)
        ) {
            this.reverseSlideIn = false;
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

    componentDidUpdate(prevProps) {
        if (prevProps.animateInTrigger !== this.props.animateInTrigger) {
            return this.animateIn();
        }

        if (prevProps.animateOutTrigger !== this.props.animateOutTrigger) {
            return this.animateOut();
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
        forEach(animationType, (type) => {
            switch (type) {
                case 'fadeIn':
                case 'fadeOut':
                    animatedStyle = merge({}, animatedStyle, { opacity: this.fadeValue });
                    break;
                case 'slideInLeft':
                case 'slideInRight':
                case 'slideOutLeft':
                case 'slideInLeftSmall':
                case 'slideInRightSmall':
                case 'slideOutLeftSmall':
                case 'slideOutRightSmall':
                    animatedStyle = merge({}, animatedStyle, { width, transform: [{ translateX: this.slideValue }] });
                    break;
                case 'slideInBottom':
                case 'slideOutBottom':
                    animatedStyle = merge({}, animatedStyle, { width, transform: [{ translateY: this.slideValue }] });
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
            case 'slideInLeft':
                return -width;
            case 'slideOutLeft':
            case 'slideOutRight':
                return 0;
            case 'slideInLeftSmall':
                return -width / 8;
            case 'slideInRightSmall':
                return width / 8;
            case 'slideOutLeftSmall':
            case 'slideOutRightSmall':
            case 'slideOutBottom':
                return 0;
            case 'slideInBottom':
                return 250;
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
            case 'slideInLeft':
            case 'slideInRight':
                return 0;
            case 'slideOutLeft':
                return this.reverseSlideOut ? width : -width;
            case 'slideOutRight':
                return width;
            case 'slideInLeftSmall':
            case 'slideInRightSmall':
                return 0;
            case 'slideOutLeftSmall':
                return this.reverseSlideOut ? width / 8 : -width / 8;
            case 'slideOutRightSmall':
                return width / 8;
            case 'slideOutBottom':
                return 250;
            case 'slideInBottom':
                return 0;
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
            case 'fadeOut':
                return Easing.elastic();
            case 'slideInLeft':
            case 'slideInRight':
            case 'slideOutLeft':
            case 'slideOutRight':
            case 'slideInLeftSmall':
            case 'slideInRightSmall':
            case 'slideOutLeftSmall':
            case 'slideOutRightSmall':
            case 'slideInBottom':
            case 'slideOutBottom':
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
            case 'fadeOut':
                return this.fadeValue;
            case 'slideInLeft':
            case 'slideInRight':
            case 'slideOutLeft':
            case 'slideOutRight':
            case 'slideInLeftSmall':
            case 'slideInRightSmall':
            case 'slideOutLeftSmall':
            case 'slideOutRightSmall':
            case 'slideInBottom':
            case 'slideOutBottom':
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
                    duration: this.props.duration,
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
                case 'fadeOut':
                    this.fadeValue = new Animated.Value(this.getStartingAnimatedValue(type));
                    break;
                case 'slideInLeft':
                case 'slideInRight':
                case 'slideOutLeft':
                case 'slideOutRight':
                case 'slideInLeftSmall':
                case 'slideInRightSmall':
                case 'slideOutLeftSmall':
                case 'slideOutRightSmall':
                case 'slideInBottom':
                case 'slideOutBottom':
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
