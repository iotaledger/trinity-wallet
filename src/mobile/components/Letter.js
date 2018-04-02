import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

export const Letter = (props) => {
    const { children, spacing, textStyle } = props;

    const letterStyles = [textStyle, { paddingRight: spacing }];

    return <Text style={letterStyles}>{children}</Text>;
};

Letter.propTypes = {
    /** Letter children content */
    children: PropTypes.string.isRequired,
    /** Letter spacing */
    spacing: PropTypes.number.isRequired,
    /** Letter text styles */
    textStyle: PropTypes.array,
};
