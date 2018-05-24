import merge from 'lodash/merge';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import { width } from '../utils/dimensions';

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
        /** Theme settings */
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
        } = this.props;

        return (
            <View style={styles.container}>
                <Button
                    onPress={onLeftButtonPress}
                    style={merge(
                        {},
                        {
                            wrapper: {
                                backgroundColor: 'rgba(0,0,0,0.15)',
                                width: width / 2,
                            },
                            children: {
                                color: '#ffffff',
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
                    style={merge({}, { wrapper: { width: width / 2 } }, rightButtonStyle)}
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
