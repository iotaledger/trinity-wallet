import merge from 'lodash/merge';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import Button from './Button';
import { width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

/** Onboarding buttons component */
class OnboardingButtons extends PureComponent {
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
    };

    static defaultProps = {
        leftButtonStyle: {},
        rightButtonStyle: {},
    };

    render() {
        const {
            leftButtonText,
            rightButtonText,
            onLeftButtonPress,
            onRightButtonPress,
            leftButtonTestID,
            rightButtonTestID,
            leftButtonStyle,
            rightButtonStyle,
            theme,
        } = this.props;

        return (
            <View style={styles.container}>
                <Button
                    onPress={onLeftButtonPress}
                    style={merge(
                        {},
                        {
                            wrapper: {
                                backgroundColor: theme.dark.color,
                                width: width / 2,
                                borderColor: theme.primary.border,
                                borderWidth: 1,
                            },
                            children: {
                                color: theme.dark.body,
                            },
                        },
                        leftButtonStyle,
                    )}
                    testID={leftButtonTestID}
                >
                    {leftButtonText}
                </Button>
                <Button
                    onPress={onRightButtonPress}
                    style={merge(
                        {},
                        {
                            wrapper: {
                                width: width / 2,
                                backgroundColor: theme.primary.color,
                            },
                            children: { color: theme.primary.body },
                        },
                        rightButtonStyle,
                    )}
                    testID={rightButtonTestID}
                >
                    {rightButtonText}
                </Button>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default connect(mapStateToProps)(OnboardingButtons);
