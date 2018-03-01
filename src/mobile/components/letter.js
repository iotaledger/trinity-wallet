import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

export const Letter = (props) => {
    const { children, spacing, textStyle } = props;

    const letterStyles = [textStyle, { paddingRight: spacing }];

    return <Text style={letterStyles}>{children}</Text>;
};

Letter.propTypes = {
    children: PropTypes.string.isRequired,
    spacing: PropTypes.number.isRequired,
    textStyle: PropTypes.object.isRequired,
};
