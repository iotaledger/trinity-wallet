import React from 'react';
import PropTypes from 'prop-types';

const images = {
    glow: require('../../../../shared/images/iota-glow.png'),
    white: require('../../../../shared/images/iota.png'),
    black: require('../../../../shared/images/iota-black.png'),
};

export default class Logo extends React.PureComponent {
    static propTypes = {
        width: PropTypes.number,
        variant: PropTypes.oneOf(['glow', 'white', 'black']).isRequired,
    };

    static defaultProps = {
        variant: 'white',
    };

    render() {
        const { width, variant, ...props } = this.props;
        return (
            // <span className={logo} width={width} />
            <img src={images[variant]} style={{ width: width || 'auto' }} {...props} />
        );
    }
}
