import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from 'mobile/src/libs/dimensions';
import General from 'mobile/src/ui/theme/general';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    children: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: General.fontSize3,
        textAlign: 'center',
    },
    wrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width,
        height: height / 11,
    },
});

export default class Button extends PureComponent {
    static propTypes = {
        /** Press event callback function */
        onPress: PropTypes.func.isRequired,
        /** Button text */
        children: PropTypes.string.isRequired,
        /** Component styles to override default ones */
        style: PropTypes.object,
        /** Id for automated screenshots */
        testID: PropTypes.string,
    };

    static defaultProps = {
        style: {},
        testID: '',
    };

    render() {
        const { style, children, testID } = this.props;

        return (
            <View style={[styles.container, style.container]}>
                <TouchableOpacity onPress={() => this.props.onPress()} testID={testID}>
                    <View style={[styles.wrapper, style.wrapper]}>
                        <Text style={[styles.children, style.children]}>{children}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}
