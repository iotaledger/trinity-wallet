import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';

const styles = StyleSheet.create({
    ctaButton: {
        borderRadius: height / 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaButtonContainer: {
        alignItems: 'center',
    },
    ctaText: {
        fontFamily: 'SourceSansPro-SemiBold',
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

class CtaButton extends PureComponent {
    static propTypes = {
        /** Press event callback function */
        onPress: PropTypes.func.isRequired,
        /** Button background color */
        ctaColor: PropTypes.string.isRequired,
        /** Button text color */
        secondaryCtaColor: PropTypes.string.isRequired,
        /** Button text */
        text: PropTypes.string,
        /** Button width */
        ctaWidth: PropTypes.number,
        /** Button height */
        ctaHeight: PropTypes.number,
        /** Button font size */
        fontSize: PropTypes.number,
        /** Id for automated screenshots */
        testID: PropTypes.string,
        /** Determines whether to display activity spinner */
        displayActivityIndicator: PropTypes.bool,
        /** Button container's style */
        containerStyle: PropTypes.object,
    };

    static defaultProps = {
        fontSize: Styling.fontSize3,
        ctaWidth: Styling.contentWidth,
        ctaHeight: height / 11,
        testID: '',
        displayActivityIndicator: false,
    };

    render() {
        const {
            ctaColor,
            secondaryCtaColor,
            text,
            ctaWidth,
            ctaHeight,
            testID,
            fontSize,
            displayActivityIndicator,
            containerStyle,
        } = this.props;

        return (
            <View style={[styles.ctaButtonContainer, containerStyle]}>
                <TouchableOpacity
                    onPress={() => {
                        this.props.onPress();
                    }}
                    testID={testID}
                >
                    <View
                        style={[
                            styles.ctaButton,
                            { backgroundColor: ctaColor },
                            { width: ctaWidth },
                            { height: ctaHeight },
                        ]}
                    >
                        {(displayActivityIndicator && <ActivityIndicator color={secondaryCtaColor} size="small" />) || (
                            <Text style={[styles.ctaText, { color: secondaryCtaColor, fontSize }]}>{text}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

export default CtaButton;
