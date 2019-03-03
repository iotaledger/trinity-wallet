import merge from 'lodash/merge';
import last from 'lodash/last';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { isIPhoneX } from 'libs/device';
import Button from './Button';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

/** DualFooterButtons component */
class DualFooterButtons extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Id for automated screenshots */
        leftButtonTestID: PropTypes.string,
        /** Id for automated screenshots */
        rightButtonTestID: PropTypes.string,
        /** Children content for button on left */
        leftButtonText: PropTypes.string.isRequired,
        /** Children content for button on right */
        rightButtonText: PropTypes.string.isRequired,
        /** Press event callback function for button on left */
        onLeftButtonPress: PropTypes.func.isRequired,
        /** Press event callback function for button on right */
        onRightButtonPress: PropTypes.func.isRequired,
        /** Left button optional styles to override the default ones */
        leftButtonStyle: PropTypes.object,
        /** Right button optional styles to override the default ones */
        rightButtonStyle: PropTypes.object,
        /** Determines if left button should display ActivityIndicator */
        isLeftButtonLoading: PropTypes.bool,
        /** Determines if right button should display ActivityIndicator */
        isRightButtonLoading: PropTypes.bool,
        /** Timeframe to debounce button presses */
        debounceTime: PropTypes.number,
        /** Current screen is navstack*/
        currentScreen: PropTypes.string,
        /** Determines whether to disable left button */
        disableLeftButton: PropTypes.bool,
        /** Determines whether to disable right button */
        disableRightButton: PropTypes.bool,
    };

    static defaultProps = {
        leftButtonStyle: {},
        rightButtonStyle: {},
        debounceTime: 300,
        disableLeftButton: false,
        disableRightButton: false,
    };

    componentWillUnmount() {
        this.timer = null;
    }

    /**
     *  Prevents multiple button presses in a given time period
     *  @method debounceHandler
     */
    debounceHandler(func) {
        if (this.timer) {
            return;
        }
        func();
        this.timer = timer.setTimeout(
            'debounce' + this.props.currentScreen,
            () => {
                this.timer = null;
            },
            this.props.debounceTime,
        );
    }

    render() {
        const {
            leftButtonText,
            rightButtonText,
            leftButtonTestID,
            rightButtonTestID,
            leftButtonStyle,
            rightButtonStyle,
            theme,
            isLeftButtonLoading,
            isRightButtonLoading,
            onLeftButtonPress,
            onRightButtonPress,
            disableLeftButton,
            disableRightButton,
        } = this.props;
        const borderRadius = isIPhoneX ? Styling.borderRadiusExtraLarge : 0;
        return (
            <View style={styles.container}>
                <Button
                    onPress={() => disableLeftButton === false && this.debounceHandler(onLeftButtonPress)}
                    style={merge(
                        {},
                        {
                            wrapper: {
                                backgroundColor: theme.dark.color,
                                width: isIPhoneX ? Styling.contentWidth / 2 : width / 2,
                                borderColor: theme.primary.border,
                                borderWidth: 1,
                                borderBottomLeftRadius: borderRadius,
                                borderTopLeftRadius: borderRadius,
                            },
                            children: {
                                color: theme.dark.body,
                            },
                            loading: {
                                color: theme.secondary.color,
                            },
                        },
                        leftButtonStyle,
                    )}
                    testID={leftButtonTestID}
                    isLoading={isLeftButtonLoading}
                    disable={disableLeftButton}
                >
                    {leftButtonText}
                </Button>
                <Button
                    onPress={() => disableRightButton === false && this.debounceHandler(onRightButtonPress)}
                    style={merge(
                        {},
                        {
                            wrapper: {
                                width: isIPhoneX ? Styling.contentWidth / 2 : width / 2,
                                backgroundColor: theme.primary.color,
                                borderBottomRightRadius: borderRadius,
                                borderTopRightRadius: borderRadius,
                                opacity: this.rightFooterButtonOpacity,
                            },
                            children: {
                                color: theme.primary.body,
                            },
                            loading: {
                                color: theme.primary.body,
                            },
                        },
                        rightButtonStyle,
                    )}
                    testID={rightButtonTestID}
                    isLoading={isRightButtonLoading}
                    disable={disableRightButton}
                >
                    {rightButtonText}
                </Button>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    currentScreen: last(state.wallet.navStack),
});

export default connect(mapStateToProps)(DualFooterButtons);
