import React, { PureComponent } from 'react';
import { Animated, View } from 'react-native';
import PropTypes from 'prop-types';
import QRCode from 'react-native-qr-generator';
import { isAndroid } from 'libs/device';

class CustomQRCode extends PureComponent {
    static propTypes = {
        /** Time to delay the initial render */
        waitFor: PropTypes.number,
        /** Size of QR code */
        size: PropTypes.number.isRequired,
        /** Value of QR code */
        value: PropTypes.string.isRequired,
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
        const { size, value } = this.props;
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
                    <QRCode backgroundColor="#00000000" size={parseInt(size)} value={value} />
                </Animated.View>
            );
        }
        return <View />;
    }
}

export default CustomQRCode;
