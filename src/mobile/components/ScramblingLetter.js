import React from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

const ScramblingLetter = (props) => {
    const { textStyle, index, scramble, letter, scramblingLetters } = props;
    return (
        <Text style={[textStyle, { opacity: scramble ? 0.5 : 1 }]}>{scramble ? scramblingLetters[index] : letter}</Text>
    );
};

ScramblingLetter.propTypes = {
    /** Letter text styles */
    textStyle: PropTypes.array,
    /** Index of current receive address character */
    index: PropTypes.number,
    /** Determines whether text should scramble */
    scramble: PropTypes.bool,
    /** Current receive address character */
    letter: PropTypes.string,
    /** Array of letters that change at random intervals */
    scramblingLetters: PropTypes.array,
};

export default ScramblingLetter;
