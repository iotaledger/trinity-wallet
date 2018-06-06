import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    ctaButton: {
        borderRadius: height / 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.2,
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
        text: PropTypes.string.isRequired,
        /** Button width */
        ctaWidth: PropTypes.number,
        /** Button height */
        ctaHeight: PropTypes.number,
        /** Button font size */
        fontSize: PropTypes.number,
        /** Id for automated screenshots */
        testID: PropTypes.string,
    };

    static defaultProps = {
        fontSize: GENERAL.fontSize3,
        ctaWidth: width / 1.15,
        ctaHeight: height / 14,
        testID: '',
    };

    render() {
        const { ctaColor, secondaryCtaColor, text, ctaWidth, ctaHeight, testID, fontSize } = this.props;

        return (
            <View style={styles.ctaButtonContainer}>
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
                            { borderColor: 'transparent' },
                            { width: ctaWidth },
                            { height: ctaHeight },
                        ]}
                    >
                        <Text style={[styles.ctaText, { color: secondaryCtaColor, fontSize }]}>{text}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

export default CtaButton;
