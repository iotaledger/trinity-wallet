import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { AnimatedLetter } from './AnimatedLetter';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
});

const AnimatedText = (props) => {
    const { children, viewStyle, textStyle, animate } = props;
    const letters = children.split('');

    return (
        <View style={[styles.container, viewStyle]}>
            {letters.map((letter, index) => (
                <AnimatedLetter key={index} index={index} textStyle={textStyle} animate={animate}>
                    {letter}
                </AnimatedLetter>
            ))}
        </View>
    );
};

AnimatedText.propTypes = {
    /** Children content */
    children: PropTypes.string.isRequired,
    /** View container styles */
    viewStyle: PropTypes.object,
    /** Letter text styles */
    textStyle: PropTypes.array,
    /** Determines whether text should animate */
    animate: PropTypes.bool,
};

export default AnimatedText;
