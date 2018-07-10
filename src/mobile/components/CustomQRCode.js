import React, { PureComponent } from 'react';
import { Image } from 'react-native';
import PropTypes from 'prop-types';
import QRCode from 'react-native-qrcode-svg';
import fakeQRImagePath from 'iota-wallet-shared-modules/images/qr.png';

class CustomQRCode extends PureComponent {
    static propTypes = {
        waitFor: PropTypes.number,
        size: PropTypes.number.isRequired,
        backgroundColor: PropTypes.string.isRequired,
    };

    static defaultProps = {
        waitFor: 1000,
    };

    constructor() {
        super();

        this.state = { renderQR: false };
    }

    componentWillMount() {
        this.timeout = setTimeout(() => {
            this.setState({ renderQR: true });
            this.timeout = null;
        }, this.props.waitFor);
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    render() {
        const { renderQR } = this.state;
        const { size, backgroundColor, ...rest } = this.props;

        if (renderQR) {
            return <QRCode size={size} backgroundColor={backgroundColor} {...rest} />;
        }

        return (
            <Image
                source={fakeQRImagePath}
                style={{
                    height: size,
                    width: size,
                    backgroundColor,
                }}
            />
        );
    }
}

export default CustomQRCode;
