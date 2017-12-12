import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './Logo.css';

const images = {
    glow: require('../../../../shared/images/iota-glow.png'),
    white: require('../../../../shared/images/iota.png'),
    black: require('../../../../shared/images/iota-black.png'),
};

export default class Logo extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        variant: PropTypes.oneOf(['glow', 'white', 'black']).isRequired,
        width: PropTypes.number,
    };

    static defaultProps = {
        variant: 'white',
    };

    render() {
        const { className, variant, width, ...props } = this.props;
        // <span className={logo} width={width} />
        return [
            <img
                key="screen"
                className={classNames(css.logo, css.screenOnly, className)}
                src={images[variant]}
                style={{ width: width || 'auto' }}
                {...props}
            />,
            <img
                key="print"
                className={classNames(css.logo, css.printOnly, className)}
                src={images.black}
                style={{ width: width || 'auto' }}
                {...props}
            />,
        ];
    }
}
