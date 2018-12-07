import React, { PureComponent } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import PropTypes from 'prop-types';
import { Icon } from 'ui/theme/icons';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: height / 16,
    },
    header: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        width: Styling.contentWidth,
        paddingTop: height / 16,
        flex: 1,
        alignItems: 'center',
    },
});

export default class Header extends PureComponent {
    static propTypes = {
        /* Text color for heading */
        textColor: PropTypes.string.isRequired,
        /* Heading text content */
        children: PropTypes.string,
    };

    render() {
        const { textColor, children } = this.props;

        return (
            <View style={styles.container}>
                <Icon name="iota" size={width / 8} color={textColor} />
                {children && <Text style={[styles.header, { color: textColor }]}>{children}</Text>}
            </View>
        );
    }
}
