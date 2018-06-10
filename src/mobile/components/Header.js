import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { width } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 1.5,
    },
    header: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 16,
        textAlign: 'center',
    },
});

export default class Header extends PureComponent {
    static propTypes = {
        /* Text color for heading */
        textColor: PropTypes.string.isRequired,
        /* Heading text content */
        children: PropTypes.string.isRequired,
    };

    render() {
        const { textColor, children } = this.props;

        return (
            <View style={styles.headerContainer}>
                <Text style={[styles.header, { color: textColor }]}>{children}</Text>
            </View>
        );
    }
}
