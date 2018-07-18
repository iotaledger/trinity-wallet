import React, { PureComponent } from 'react';
import { Animated, View } from 'react-native';
import PropTypes from 'prop-types';
import QRCode from 'react-native-qrcode-svg';
import { isAndroid } from '../utils/device';

class CustomQRCode extends PureComponent {
    static propTypes = {
        waitFor: PropTypes.number,
        size: PropTypes.number.isRequired,
        backgroundColor: PropTypes.string.isRequired,
    };

    static defaultProps = {
        waitFor: isAndroid ? 5 : 0,
    };

    constructor() {
        super();

        this.state = {
            renderQR: false,
            animatedOpacity: new Animated.Value(0),
        };
    }

    componentWillMount() {
        this.timeout = setTimeout(() => {
            this.setState({ renderQR: true });
            this.timeout = null;
        }, this.props.waitFor);
    }

    componentDidMount() {
        this.onLoad();
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    onLoad = () => {
        Animated.timing(this.state.animatedOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    render() {
        const { renderQR } = this.state;
        const { size, backgroundColor, ...rest } = this.props;
        const { animatedOpacity } = this.state;

        if (renderQR) {
            return (
                <Animated.View
                    style={
                        isAndroid
                            ? {
                                  opacity: animatedOpacity.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0, 1],
                                  }),
                              }
                            : null
                    }
                >
                    <QRCode size={size} backgroundColor={backgroundColor} {...rest} />
                </Animated.View>
            );
        }
        return <View />;
    }
}

export default CustomQRCode;
