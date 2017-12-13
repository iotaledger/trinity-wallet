import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, RadialGradient, Path } from 'react-native-svg';

class BorderShadow extends Component {
    render() {
        const { side, width, color, border, opacity, inset, style, children } = this.props;

        const linear = key => [
            <Stop offset="0" stopColor={color} stopOpacity={opacity} key={`${key}Linear0`} />,
            <Stop offset="1" stopColor={color} stopOpacity="0" key={`${key}Linear1`} />,
        ];

        const lineWidth = border;

        let topComponent;
        let bottomComponent;
        if (side === 'top') {
            topComponent = (
                <Svg
                    height={lineWidth}
                    width={width + lineWidth}
                    style={{ position: 'absolute', top: inset ? 0 : -lineWidth }}
                >
                    <Defs>
                        <LinearGradient id="top" x1="0" y1={lineWidth} x2="0" y2="0">
                            {linear('BorderTop')}
                        </LinearGradient>
                        <LinearGradient id="top-inset" x1="0" y1="0" x2="0" y2={lineWidth}>
                            {linear('BorderTopInset')}
                        </LinearGradient>
                    </Defs>
                    <Rect x={0} y={0} width={width} height={lineWidth} fill={`url(#top${inset ? '-inset' : ''})`} />
                </Svg>
            );
            bottomComponent = children;
        } else if (side === 'bottom') {
            topComponent = children;
            bottomComponent = (
                <Svg
                    height={lineWidth}
                    width={width + lineWidth}
                    style={{ position: 'absolute', bottom: inset ? -lineWidth : 0 }}
                >
                    <Defs>
                        <LinearGradient id="bottom" x1="0" y1="0" x2="0" y2={lineWidth}>
                            {linear('BorderBottom')}
                        </LinearGradient>
                        <LinearGradient id="bottom-inset" x1="0" y1={lineWidth} x2="0" y2="0">
                            {linear('BorderBottomInset')}
                        </LinearGradient>
                    </Defs>
                    <Rect x={0} y={0} width={width} height={lineWidth} fill={`url(#bottom${inset ? '-inset' : ''})`} />
                </Svg>
            );
        } else {
            throw new Error("Wrong Type of Side! We just support 'top' and 'bottom'");
        }

        return (
            <View style={[{ position: 'relative', width }, style]}>
                {topComponent}
                {bottomComponent}
            </View>
        );
    }
}

BorderShadow.defaultProps = {
    side: 'bottom',
    width: 0,
    color: '#000',
    border: 0,
    opacity: 1,
    inset: false,
    style: {},
};

BorderShadow.propTypes = {
    side: PropTypes.string,
    width: PropTypes.number,
    color: PropTypes.string,
    border: PropTypes.number,
    opacity: PropTypes.number,
    inset: PropTypes.bool,
    style: PropTypes.object,
    children: PropTypes.node.isRequired,
};

export default BorderShadow;
