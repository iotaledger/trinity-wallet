import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Letter } from './letter';

const spacingForLetterIndex = (letters, index, spacing) => (letters.length - 1 === index ? 0 : spacing);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
});

const TextWithLetterSpacing = (props) => {
    const { children, spacing, viewStyle, textStyle } = props;
    const letters = children.split('');

    return (
        <View style={[styles.container, viewStyle]}>
            {letters.map((letter, index) => (
                <Letter key={index} spacing={spacingForLetterIndex(letters, index, spacing)} textStyle={textStyle}>
                    {letter}
                </Letter>
            ))}
        </View>
    );
};

TextWithLetterSpacing.propTypes = {
    children: PropTypes.string.isRequired,
    spacing: PropTypes.number.isRequired,
    viewStyle: PropTypes.object,
    textStyle: PropTypes.array,
};

export default TextWithLetterSpacing;
