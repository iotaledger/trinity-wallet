import merge from 'lodash/merge';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
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
        const borderRadius = isIPhoneX ? parseInt(width / 20) : 0;
        return (
            <View style={styles.container}>
                <Button
                    onPress={onLeftButtonPress}
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
                                width: isIPhoneX ? Styling.contentWidth / 2 : width / 2,
                                backgroundColor: theme.primary.color,
                                borderBottomRightRadius: borderRadius,
                                borderTopRightRadius: borderRadius,
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

export default connect(mapStateToProps)(DualFooterButtons);
