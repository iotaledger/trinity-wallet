import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        width: Styling.contentWidth,
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
            <View style={styles.container}>
                <Text style={[styles.header, { color: textColor }]}>{children}</Text>
            </View>
        );
    }
}
