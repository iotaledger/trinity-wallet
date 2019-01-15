import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PanResponder, Easing, Animated, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import sliderLoadingAnimation from 'shared-modules/animations/slider-loader.json';
import sliderSuccessAnimation from 'shared-modules/animations/slider-success.json';
import timer from 'react-native-timer';
import { height as deviceHeight } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderRadius: deviceHeight / 10,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    text: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        position: 'absolute',
        backgroundColor: 'transparent',
    },
    slider: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

class SendProgressBar extends Component {
    static propTypes = {
        /** Index of active progress step */
        activeStepIndex: PropTypes.number.isRequired,
        /** Total number of progress steps */
        totalSteps: PropTypes.number,
        /** Filled bar color */
        filledColor: PropTypes.string,
        /** Unfilled bar color */
        unfilledColor: PropTypes.string,
        /** Progress bar width */
        channelWidth: PropTypes.number,
        /** Progress bar height */
        channelHeight: PropTypes.number,
        /** Progress bar text color */
        textColor: PropTypes.string,
        /** Progress bar text */
        progressText: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        /** Slider color before successful swipe */
        preSwipeColor: PropTypes.string,
        /** Slider color after successful swipe */
        postSwipeColor: PropTypes.string,
        /** Text displayed when not in progress */
        staticText: PropTypes.string,
        /** Called on successful swipe */
        onSwipeSuccess: PropTypes.func,
        /** Interupts the progress bar when changed */
        interupt: PropTypes.bool,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    static defaultProps = {
        channelWidth: Styling.contentWidth,
        channelHeight: deviceHeight / 12,
    };

    constructor(props) {
        super(props);
        const isAlreadyInProgress = props.totalSteps > 0 && props.activeStepIndex !== props.totalSteps;
        const sliderEndPosition = props.channelWidth - props.channelHeight;
        const progress = isAlreadyInProgress ? props.activeStepIndex / props.totalSteps : -1;
        this.state = {
            animatedProgressValue: new Animated.Value(isAlreadyInProgress ? progress : 0),
            sliderPosition: new Animated.Value(isAlreadyInProgress ? sliderEndPosition : props.channelHeight * 0.1),
            thresholdDistance: sliderEndPosition,
            sliderColor: isAlreadyInProgress ? props.postSwipeColor : props.preSwipeColor,
            textOpacity: new Animated.Value(1),
            sliderOpacity: new Animated.Value(1),
            progressText: isAlreadyInProgress ? props.progressText : '',
            inProgress: isAlreadyInProgress,
            sliderAnimation: sliderLoadingAnimation,
            sliderSize: new Animated.Value(isAlreadyInProgress ? props.channelHeight : props.channelHeight * 0.8),
        };
        // Global progress
        this.globalProgress = progress;
        // Local progress (arbitrarily increments)
        this.localProgressWithIncrement = progress;
        // Total steps for most recent progress instance
        this.latestTotalSteps = props.totalSteps;
    }

    componentWillMount() {
        if (this.props.totalSteps > 0 && this.props.activeStepIndex !== this.props.totalSteps) {
            this.animateProgressBar();
        }
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderMove: (evt, gestureState) => {
                if (this.state.inProgress) {
                    return;
                }
                Animated.timing(this.state.sliderSize, {
                    toValue: this.props.channelHeight,
                    duration: 100,
                }).start();
                const moveValue = gestureState.dx;
                const sliderPosition = moveValue / this.state.thresholdDistance;
                this.state.textOpacity.setValue(1 - sliderPosition * 2);
                this.state.sliderOpacity.setValue(1 - sliderPosition / 2.5);
                if (moveValue >= 0 && moveValue <= this.state.thresholdDistance) {
                    this.state.sliderPosition.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (this.state.inProgress) {
                    return;
                }
                const releaseValue = gestureState.dx;
                if (releaseValue >= this.state.thresholdDistance && this.props.activeStepIndex < 0) {
                    this.onCompleteSwipe();
                } else {
                    this.resetSlider();
                }
            },
            onPanResponderTerminate: () => {},
            onPanResponderTerminationRequest: () => true,
        });
    }

    componentDidMount() {
        if (this.props.totalSteps > 0 && this.props.activeStepIndex !== this.props.totalSteps) {
            this.sliderAnimation.play();
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.activeStepIndex !== newProps.activeStepIndex) {
            // On first progress change
            if (this.props.activeStepIndex < 0) {
                this.setState({ inProgress: true });
                this.animateProgressBar();
                this.sliderAnimation.play();
            }
            // On every progress change
            this.latestTotalSteps = newProps.totalSteps > 0 ? newProps.totalSteps : this.latestTotalSteps;
            const progress = newProps.activeStepIndex / this.latestTotalSteps;
            // Updates local and global progress, and ensures totalSteps > 0
            this.globalProgress = progress;
            this.localProgressWithIncrement = progress;
            this.onActiveStepChange(newProps.progressText);
            // On last progress change
            if (this.props.totalSteps > 0 && newProps.activeStepIndex === this.props.totalSteps) {
                this.onProgressComplete();
            }
        }
        if (this.props.interupt !== newProps.interupt && this.props.activeStepIndex !== this.props.totalSteps) {
            this.onInterupt();
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delayProgressTextChange' + this.props.activeStepIndex);
        timer.clearTimeout('delayProgressTextFadeOut');
        timer.clearTimeout('delaySliderReset');
        timer.clearTimeout('delaySuccessAnimation');
        timer.clearTimeout('delaySliderOpacityIncreaseAnimation');
    }

    onProgressComplete() {
        this.sliderAnimation.reset();
        this.setState({ sliderAnimation: sliderSuccessAnimation, shouldLoopSliderAnimation: false });
        timer.setTimeout(
            'delaySliderOpacityIncreaseAnimation',
            () => {
                Animated.timing(this.state.sliderOpacity, {
                    toValue: 1,
                    duration: 300,
                    easing: Easing.ease,
                }).start();
            },
            900,
        );
        timer.setTimeout(
            'delaySuccessAnimation',
            () => {
                this.sliderAnimation.play();
            },
            1200,
        );
        timer.setTimeout(
            'delaySliderReset',
            () => {
                this.sliderAnimation.reset();
                this.globalProgress = -1;
                this.setState({
                    inProgress: false,
                    sliderAnimation: sliderLoadingAnimation,
                    shouldLoopSliderAnimation: true,
                });
                this.state.animatedProgressValue.setValue(0);
                this.resetSlider();
            },
            5000,
        );
    }

    onInterupt() {
        this.sliderAnimation.reset();
        this.globalProgress = -1;
        this.setState({ inProgress: false });
        Animated.timing(this.state.animatedProgressValue).stop();
        this.state.animatedProgressValue.setValue(0);
        Animated.timing(this.state.sliderPosition).stop();
        this.resetSlider();
    }

    onCompleteSwipe() {
        ReactNativeHapticFeedback.trigger('impactLight', false);
        Animated.timing(this.state.sliderPosition, {
            toValue: this.props.channelWidth - this.props.channelHeight,
            duration: 50,
        }).start();
        this.setState({ sliderColor: this.props.postSwipeColor });
        this.props.onSwipeSuccess();
    }

    onActiveStepChange(progressText) {
        // On first step change
        if (this.globalProgress === 0) {
            this.setState({ progressText });
            return Animated.timing(this.state.textOpacity, {
                toValue: 1,
                duration: 100,
            }).start();
        }

        // On all but first step changes
        if (this.globalProgress >= 0) {
            timer.setTimeout(
                'delayProgressTextChange' + this.props.activeStepIndex,
                () => {
                    Animated.timing(this.state.textOpacity, {
                        toValue: 0,
                        duration: 100,
                    }).start(() => {
                        this.setState({ progressText });
                        Animated.timing(this.state.textOpacity, {
                            toValue: 1,
                            duration: 100,
                        }).start();
                    });
                },
                300,
            );
        }

        // On last step change
        if (this.globalProgress === 1) {
            return timer.setTimeout(
                'delayProgressTextFadeOut',
                () => {
                    Animated.timing(this.state.textOpacity, {
                        toValue: 0,
                        duration: 100,
                    }).start();
                },
                5000,
            );
        }
    }

    animateProgressBar() {
        const stepSize = 1 / this.latestTotalSteps;
        const nextStep = this.globalProgress + stepSize;
        const increment = stepSize / 100;
        const updatedIncrement = this.localProgressWithIncrement + increment;
        if (this.localProgressWithIncrement < nextStep - stepSize / 5) {
            this.localProgressWithIncrement = updatedIncrement;
        }
        Animated.timing(this.state.animatedProgressValue, {
            toValue: Math.max(this.globalProgress, this.localProgressWithIncrement),
            useNativeDriver: true,
            easing: Easing.ease,
        }).start(() => {
            if (this.localProgressWithIncrement <= 1 && this.state.inProgress) {
                this.animateProgressBar();
            }
        });
    }

    resetSlider() {
        const duration = 500;
        this.setState({ sliderColor: this.props.preSwipeColor });
        Animated.parallel([
            Animated.spring(this.state.sliderPosition, {
                toValue: this.props.channelHeight * 0.1,
                duration,
            }),
            Animated.timing(this.state.sliderOpacity, {
                toValue: 1,
                duration,
            }),
            Animated.timing(this.state.textOpacity, {
                toValue: 1,
                duration,
            }),
            Animated.timing(this.state.sliderSize, {
                toValue: this.props.channelHeight * 0.8,
                duration: 100,
            }),
        ]).start(() => {
            this.setState({
                sliderPosition: new Animated.Value(this.props.channelHeight * 0.1),
                sliderOpacity: new Animated.Value(1),
                textOpacity: new Animated.Value(1),
                sliderSize: new Animated.Value(this.props.channelHeight * 0.8),
            });
        });
    }

    render() {
        const { channelHeight, channelWidth, textColor, staticText, unfilledColor, filledColor, t } = this.props;
        return (
            <View style={[styles.container, { height: channelHeight }]}>
                <View
                    style={[
                        styles.container,
                        { height: channelHeight, width: channelWidth, backgroundColor: unfilledColor },
                    ]}
                >
                    <Animated.View
                        style={{
                            backgroundColor: filledColor,
                            height: channelHeight,
                            width: channelWidth,
                            transform: [
                                {
                                    translateX: this.state.animatedProgressValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-channelWidth, 0],
                                    }),
                                },
                            ],
                        }}
                    />
                    {(this.state.inProgress && (
                        <Animated.Text style={[styles.text, { color: textColor, opacity: this.state.textOpacity }]}>
                            {t(this.state.progressText)}
                        </Animated.Text>
                    )) || (
                        <Animated.Text style={[styles.text, { color: textColor, opacity: this.state.textOpacity }]}>
                            {staticText}
                        </Animated.Text>
                    )}
                </View>
                <Animated.View
                    {...this._panResponder.panHandlers}
                    style={[
                        {
                            width: channelWidth,
                            height: deviceHeight / 13,
                            position: 'absolute',
                            justifyContent: 'center',
                            opacity: this.state.sliderOpacity,
                        },
                        {
                            transform: [{ translateX: this.state.sliderPosition }],
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.slider,
                            {
                                width: this.state.sliderSize,
                                height: this.state.sliderSize,
                                backgroundColor: this.state.sliderColor,
                                borderRadius: channelHeight,
                            },
                        ]}
                    >
                        <LottieView
                            ref={(animation) => {
                                this.sliderAnimation = animation;
                            }}
                            source={this.state.sliderAnimation}
                            style={{ width: channelHeight * 0.9, height: channelHeight * 0.9, position: 'absolute' }}
                            loop={this.state.shouldLoopSliderAnimation}
                        />
                        {!this.state.inProgress && (
                            <Icon
                                name="chevronRight"
                                size={channelHeight / 3}
                                color={unfilledColor}
                                style={{ backgroundColor: 'transparent' }}
                            />
                        )}
                    </Animated.View>
                </Animated.View>
            </View>
        );
    }
}

export default SendProgressBar;
