import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PanResponder, Easing, Animated, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { withNamespaces } from 'react-i18next';
import timer from 'react-native-timer';
import sliderSuccessAnimation from 'shared-modules/animations/slider-success.json';
import { height as deviceHeight, width } from 'libs/dimensions';
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

class Slider extends Component {
    static propTypes = {
        /** Filled channel color */
        filledColor: PropTypes.string,
        /** Unfilled channel color */
        unfilledColor: PropTypes.string,
        /** Slider width */
        channelWidth: PropTypes.number,
        /** Slider height */
        channelHeight: PropTypes.number,
        /** Slider text color */
        textColor: PropTypes.string,
        /** Slider text */
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        /** Slider color before successful swipe */
        preSwipeColor: PropTypes.string,
        /** Slider color after successful swipe */
        postSwipeColor: PropTypes.string,
        /** Called on successful swipe */
        onSwipeSuccess: PropTypes.func,
        /** Determines whether swipe should render as complete */
        renderSwipeComplete: PropTypes.bool,
        /** Determines whether to block swipe */
        blockSwipe: PropTypes.bool,
        /* Text before swiping */
        preSwipeText: PropTypes.string,
        /* Text after swiping */
        postSwipeText: PropTypes.string,
        /** Resets slider when changed */
        sliderReset: PropTypes.bool,
        /** Number of slider instances */
        numberOfSliders: PropTypes.number,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    static defaultProps = {
        channelWidth: Styling.contentWidth,
        channelHeight: deviceHeight / 12,
        renderSwipeComplete: false,
        blockSwipe: false,
        sliderReset: false,
        numberOfSliders: 1,
    };

    constructor(props) {
        super(props);
        const sliderEndPosition = props.channelWidth - props.channelHeight;
        this.state = {
            sliderPosition: new Animated.Value(
                props.renderSwipeComplete ? sliderEndPosition : props.channelHeight * 0.1,
            ),
            thresholdDistance: sliderEndPosition,
            sliderColor: props.renderSwipeComplete ? props.postSwipeColor : props.preSwipeColor,
            textOpacity: new Animated.Value(1),
            sliderSize: new Animated.Value(props.renderSwipeComplete ? props.channelHeight : props.channelHeight * 0.8),
            swipeComplete: props.renderSwipeComplete,
            sliderNumber: 1,
        };
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderMove: (evt, gestureState) => {
                if (this.props.blockSwipe || this.state.swipeComplete) {
                    return;
                }
                Animated.timing(this.state.sliderSize, {
                    toValue: this.props.channelHeight,
                    duration: 100,
                }).start();
                const moveValue = gestureState.dx;
                const sliderPosition = moveValue / this.state.thresholdDistance;
                this.state.textOpacity.setValue(1 - sliderPosition * 2);
                if (moveValue >= 0 && moveValue <= this.state.thresholdDistance) {
                    this.state.sliderPosition.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (this.props.blockSwipe || this.state.swipeComplete) {
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

    componentWillReceiveProps(newProps) {
        if (this.props.sliderReset !== newProps.sliderReset) {
            timer.setTimeout('delaySliderReset', () => this.resetSlider(), 1000);
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delaySwipeSuccess');
        timer.clearTimeout('delaySliderReset');
    }

    onIncompleteSwipe() {
        const duration = 500;
        Animated.parallel([
            Animated.spring(this.state.sliderPosition, {
                toValue: this.props.channelHeight * 0.1,
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

    onCompleteSwipe() {
        ReactNativeHapticFeedback.trigger('impactLight', false);
        Animated.timing(this.state.sliderPosition, {
            toValue: this.props.channelWidth - this.props.channelHeight,
            duration: 50,
        }).start();
        if (this.props.numberOfSliders > 1) {
            this.setState({ sliderNumber: this.state.sliderNumber + 1 });
        }
        this.setState({ sliderColor: this.props.postSwipeColor, swipeComplete: true });
        this.sliderAnimation.play();
        timer.setTimeout(
            'delaySwipeSuccess',
            () => {
                Animated.timing(this.state.textOpacity, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.ease,
                }).start(() => this.props.onSwipeSuccess());
            },
            300,
        );
    }

    getText() {
        const { t, preSwipeText, postSwipeText, numberOfSliders } = this.props;
        if (this.state.swipeComplete) {
            return postSwipeText || t('confirmed');
        }
        if (numberOfSliders > 1) {
            return (preSwipeText || t('swipeToConfirm')) + ' (' + this.state.sliderNumber + '/' + numberOfSliders + ')';
        }
        return preSwipeText || t('swipeToConfirm');
    }

    resetSlider() {
        const duration = 500;
        this.sliderAnimation.reset();
        this.setState({ sliderColor: this.props.preSwipeColor, swipeComplete: false });
        Animated.parallel([
            Animated.spring(this.state.sliderPosition, {
                toValue: this.props.channelHeight * 0.1,
                duration,
                easing: Easing.elastic(),
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
        const { channelHeight, channelWidth, unfilledColor, textColor } = this.props;
        return (
            <View style={[styles.container, { height: channelHeight, width }]}>
                <View
                    style={[
                        styles.container,
                        { height: channelHeight, width: channelWidth, backgroundColor: unfilledColor },
                    ]}
                >
                    <Animated.View
                        {...this._panResponder.panHandlers}
                        style={[
                            {
                                width: channelWidth,
                                height: deviceHeight / 13,
                                position: 'absolute',
                                justifyContent: 'center',
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
                                source={sliderSuccessAnimation}
                                style={{
                                    width: channelHeight * 0.9,
                                    height: channelHeight * 0.9,
                                    position: 'absolute',
                                }}
                                loop={false}
                            />
                            {!this.state.swipeComplete && (
                                <Icon
                                    name="chevronRight"
                                    size={channelHeight / 3}
                                    color={unfilledColor}
                                    style={{ backgroundColor: 'transparent' }}
                                />
                            )}
                        </Animated.View>
                    </Animated.View>
                    <Animated.Text style={[styles.text, { color: textColor, opacity: this.state.textOpacity }]}>
                        {this.getText()}
                    </Animated.Text>
                </View>
            </View>
        );
    }
}

export default withNamespaces('global')(Slider);
