import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    ctaButton: {
        borderRadius: height / 15,
        height: height / 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.2,
    },
    ctaButtonContainer: {
        alignItems: 'center',
    },
    ctaText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
});

class CtaButton extends React.Component {
    static propTypes = {
        onPress: PropTypes.func.isRequired,
        ctaColor: PropTypes.string.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        ctaBorderColor: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        ctaWidth: PropTypes.number,
        testID: PropTypes.string,
    };

    static defaultProps = {
        ctaWidth: width / 1.2,
        testID: '',
    };

    onCtaPress() {
        this.props.onPress();
    }

    render() {
        const { ctaColor, ctaBorderColor, secondaryCtaColor, text, ctaWidth, testID } = this.props;

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
                            { borderColor: ctaBorderColor },
                            { width: ctaWidth },
                        ]}
                    >
                        <Text style={[styles.ctaText, { color: secondaryCtaColor }]}>{text}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

export default CtaButton;
