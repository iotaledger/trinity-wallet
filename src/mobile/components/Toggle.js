import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { width } from '../utils/dimensions';
import { isAndroid } from '../utils/device';

const styles = StyleSheet.create({
    toggle: {
        borderWidth: 1.5,
        justifyContent: 'center',
    },
    toggleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleCircle: {},
});

class Toggle extends PureComponent {
    static propTypes = {
        /** Determines whether the toggle is active or not */
        active: PropTypes.bool.isRequired,
        bodyColor: PropTypes.string.isRequired,
        primaryColor: PropTypes.string.isRequired,
        scale: PropTypes.number,
        opacity: PropTypes.number,
    };

    static defaultProps = {
        scale: 1,
        opacity: 1,
    };

    render() {
        const { active, primaryColor, bodyColor, scale, opacity } = this.props;
        const size = width * scale;
        return (
            <View style={[styles.toggleContainer, { width: size / 12, height: size / 12 }]}>
                <View
                    style={[
                        styles.toggle,
                        {
                            alignItems: active ? 'flex-end' : 'flex-start',
                            borderColor: bodyColor,
                            width: size / 13,
                            height: size / 22,
                            borderRadius: size / 40,
                            paddingHorizontal: size / 300,
                            opacity: isAndroid ? opacity * 2 : opacity,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.toggleCircle,
                            {
                                backgroundColor: primaryColor,
                                width: size / 33,
                                height: size / 33,
                                borderRadius: size / 33,
                            },
                        ]}
                    />
                </View>
            </View>
        );
    }
}

export default Toggle;
