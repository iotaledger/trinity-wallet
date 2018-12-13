import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    children: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize3,
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
        /** Determines whether to display ActivityIndicator */
        isLoading: PropTypes.bool,
        /** Determines whether to disable button */
        disable: PropTypes.bool,
    };

    static defaultProps = {
        style: {},
        testID: '',
        disable: false,
    };

    constructor(props) {
        super(props);
        this.opacity = new Animated.Value(props.disable ? 0.4 : 1);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.disable && !newProps.disable) {
            Animated.timing(this.opacity, {
                toValue: 1,
                duration: 900,
                easing: Easing.ease,
            }).start();
        }
    }

    render() {
        const { style, children, testID, isLoading } = this.props;

        return (
            <Animated.View style={[styles.container, style.container, { opacity: this.opacity }]}>
                <TouchableOpacity onPress={() => this.props.onPress()} testID={testID}>
                    <View style={[styles.wrapper, style.wrapper]}>
                        {(isLoading && <ActivityIndicator color={style.loading.color} size="small" />) || (
                            <Text style={[styles.children, style.children]}>{children}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }
}
