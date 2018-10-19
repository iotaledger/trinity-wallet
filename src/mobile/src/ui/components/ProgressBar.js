import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PanResponder, Easing, Animated, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
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

class ProgressBar extends Component {
    static propTypes = {
        /** Progress percentage number */
        progress: PropTypes.number.isRequired,
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
        /** Total number of progress steps */
        stepSize: PropTypes.number,
        /** Slider color before successful swipe */
        preSwipeColor: PropTypes.string,
        /** Slider color after successful swipe */
        postSwipeColor: PropTypes.string,
        /** Text displayed when not in progress */
        staticText: PropTypes.string,
        /** Called on successful swipe */
        onCompleteSwipe: PropTypes.func,
        /** Interupts the progress bar when changed */
        interupt: PropTypes.bool,
    };

    static defaultProps = {
        channelWidth: Styling.contentWidth,
        channelHeight: deviceHeight / 13,
    };

    constructor(props) {
        super(props);
        const isAlreadyInProgress = props.progress > -1;
        const sliderEndPosition = props.channelWidth - props.channelHeight;
        this.state = {
            progressPosition: new Animated.Value(isAlreadyInProgress ? props.progress : 0),
            progressStep: props.progress,
            progressIncrement: isAlreadyInProgress ? props.progress : 0,
            sliderPosition: new Animated.Value(isAlreadyInProgress ? sliderEndPosition : props.channelHeight * 0.1),
            thresholdDistance: sliderEndPosition,
            sliderColor: isAlreadyInProgress ? props.postSwipeColor : props.preSwipeColor,
            textOpacity: new Animated.Value(1),
            sliderOpacity: new Animated.Value(1),
            progressText: isAlreadyInProgress ? props.progressText : '',
            inProgress: isAlreadyInProgress,
            sliderAnimation: sliderLoadingAnimation,
            sliderSize: new Animated.Value(props.channelHeight * 0.8),
        };
    }

    componentWillMount() {
        if (this.props.progress > -1) {
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
                const relativeSlidePosition = moveValue / this.state.thresholdDistance;
                this.state.textOpacity.setValue(1 - relativeSlidePosition * 2);
                this.state.sliderOpacity.setValue(1 - relativeSlidePosition / 2.5);
                if (moveValue >= 0 && moveValue <= this.state.thresholdDistance) {
                    this.state.sliderPosition.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (this.state.inProgress) {
                    return;
                }
                const releaseValue = gestureState.dx;
                if (releaseValue >= this.state.thresholdDistance) {
                    this.onCompleteSwipe();
                } else {
                    this.onIncompleteSwipe();
                }
            },
            onPanResponderTerminate: () => {},
            onPanResponderTerminationRequest: () => true,
        });
    }

    componentDidMount() {
        if (this.props.progress > -1 && this.sliderAnimation) {
            this.sliderAnimation.play();
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.progress !== newProps.progress) {
            // On first progress change
            if (this.props.progress < 0) {
                this.setState({ inProgress: true });
                this.animateProgressBar();
                this.sliderAnimation.play();
            }
            // On every progress change
            this.setState({ progressStep: newProps.progress, progressIncrement: newProps.progress });
            this.onProgressStepChange(newProps.progressText);
            // On last progress change
            if (this.props.stepSize > 0 && newProps.progress === 1 - this.props.stepSize) {
                this.onProgressComplete();
            }
        }
        if (this.props.interupt !== newProps.interupt) {
            this.onInterupt();
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delayProgressTextChange');
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
                this.setState({
                    progressStep: -1,
                    inProgress: false,
                    sliderAnimation: sliderLoadingAnimation,
                    shouldLoopSliderAnimation: true,
                });
                this.state.progressPosition.setValue(0);
                this.resetSlider();
            },
            4000,
        );
    }

    onIncompleteSwipe() {
        const duration = 500;
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
        ]).start();
        Animated.timing(this.state.sliderSize, {
            toValue: this.props.channelHeight * 0.8,
            duration: 100,
        }).start();
    }

    onInterupt() {
        this.setState({ progressStep: -1, inProgress: false });
        Animated.timing(this.state.progressPosition).stop();
        this.state.progressPosition.setValue(0);
        Animated.timing(this.state.sliderPosition).stop();
        this.resetSlider();
    }

    onCompleteSwipe() {
        Animated.timing(this.state.sliderPosition, {
            toValue: this.props.channelWidth - this.props.channelHeight,
            duration: 50,
        }).start();
        this.setState({ sliderColor: this.props.postSwipeColor });
        this.props.onCompleteSwipe();
    }

    onProgressStepChange(progressText) {
        // On first step change
        if (this.state.progressStep < 0) {
            this.setState({ progressText });
            return Animated.timing(this.state.textOpacity, {
                toValue: 1,
                duration: 100,
            }).start();
        }
        // On last step change
        if (this.state.progressStep === 1) {
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
        // On any other step change
        if (this.state.progressStep >= 0) {
            return timer.setTimeout(
                'delayProgressTextChange',
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
    }

    animateProgressBar() {
        const nextStep = this.state.progressStep + this.props.stepSize;
        const increment = this.props.stepSize / 100;
        const updatedIncrement = this.state.progressIncrement + increment;
        if (this.state.progressIncrement < nextStep - this.props.stepSize / 5) {
            this.setState({ progressIncrement: updatedIncrement });
        }
        Animated.timing(this.state.progressPosition, {
            toValue: Math.max(this.state.progressStep, this.state.progressIncrement),
            useNativeDriver: true,
            easing: Easing.ease,
        }).start(() => {
            if (this.state.progressIncrement <= 1 && this.state.inProgress) {
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
                easing: Easing.elastic(),
            }),
            Animated.timing(this.state.sliderOpacity, {
                toValue: 1,
                duration,
                easing: Easing.ease,
            }),
            Animated.timing(this.state.textOpacity, {
                toValue: 1,
                duration,
                easing: Easing.ease,
            }),
        ]).start();
        Animated.timing(this.state.sliderSize, {
            toValue: this.props.channelHeight * 0.8,
            duration: 100,
        }).start();
    }

    render() {
        const { channelHeight, channelWidth, textColor, staticText, unfilledColor, filledColor } = this.props;
        const progressBarStyle = {
            backgroundColor: filledColor,
            height: channelHeight,
            width: channelWidth,
            transform: [
                {
                    translateX: this.state.progressPosition.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-channelWidth, 0],
                    }),
                },
            ],
        };
        return (
            <View style={[styles.container, { height: channelHeight }]}>
                <View
                    style={[
                        styles.container,
                        { height: channelHeight, width: channelWidth, backgroundColor: unfilledColor },
                    ]}
                >
                    <Animated.View style={progressBarStyle} />
                    {(this.state.inProgress && (
                        <Animated.Text style={[styles.text, { color: textColor, opacity: this.state.textOpacity }]}>
                            {this.state.progressText}
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

export default ProgressBar;
