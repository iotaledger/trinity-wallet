import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import ScramblingLetter from './ScramblingLetter';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
});

const ScramblingText = (props) => {
    const { children, viewStyle, textStyle, scramble, scramblingLetters, rowIndex } = props;
    const letters = children.split('');
    const indexFactor = rowIndex * letters.length;
    return (
        <View style={[styles.container, viewStyle]}>
            {letters.map((letter, index) => (
                <ScramblingLetter
                    key={index + indexFactor}
                    scramblingLetters={scramblingLetters}
                    letter={letter}
                    index={index + indexFactor}
                    textStyle={textStyle}
                    scramble={scramble}
                />
            ))}
        </View>
    );
};

ScramblingText.propTypes = {
    /** Children content */
    children: PropTypes.string.isRequired,
    /** View container styles */
    viewStyle: PropTypes.object,
    /** Letter text styles */
    textStyle: PropTypes.array,
    /** Determines whether text should scramble */
    scramble: PropTypes.bool,
    /** Array of letters that change at random intervals */
    scramblingLetters: PropTypes.array,
    /** Index of current row of letters  */
    rowIndex: PropTypes.number,
};

export default ScramblingText;
