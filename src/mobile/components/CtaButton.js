import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from '../utils/dimensions';

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
        fontFamily: 'Lato-Regular',
        backgroundColor: 'transparent',
    },
});

class CtaButton extends PureComponent {
    static propTypes = {
        onPress: PropTypes.func.isRequired,
        ctaColor: PropTypes.string.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        ctaWidth: PropTypes.number,
        ctaHeight: PropTypes.number,
        testID: PropTypes.string,
        fontSize: PropTypes.number,
    };

    static defaultProps = {
        fontSize: width / 27.6,
        ctaWidth: width / 1.2,
        ctaHeight: height / 14,
        testID: '',
    };

    onCtaPress() {
        this.props.onPress();
    }

    render() {
        const { ctaColor, secondaryCtaColor, text, ctaWidth, ctaHeight, testID, fontSize } = this.props;

        return (
            <View style={styles.ctaButtonContainer}>
                <TouchableOpacity
                    onPress={() => {
                        this.onCtaPress();
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
