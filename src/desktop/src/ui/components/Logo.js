import React from 'react';
import PropTypes from 'prop-types';
import Lottie from 'react-lottie';

import * as loading from 'animations/loading-white.json';
import Icon from 'ui/components/Icon';

import css from './logo.css';

/**
 * IOTA animated/static logo component
 */
export default class Logo extends React.PureComponent {
    static propTypes = {
        /** Logo size */
        size: PropTypes.number,
        /** Animation state */
        animate: PropTypes.bool,
        /** Should animation loop state */
        loop: PropTypes.bool,
    };

    render() {
        const { size, loop, animate } = this.props;

        const options = {
            loop: loop,
            autoplay: true,
            animationData: loading,
        };

        return (
            <div className={css.logo} style={{ width: size, height: size }}>
                {!animate ? <Icon icon="iota" size={size} /> : <Lottie width={size} height={size} options={options} />}
            </div>
        );
    }
}
