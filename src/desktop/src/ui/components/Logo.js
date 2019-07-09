import React from 'react';
import PropTypes from 'prop-types';

import { getAnimation } from 'animations';
import Icon from 'ui/components/Icon';
import Lottie from 'ui/components/Lottie';

import css from './logo.scss';

/**
 * IOTA animated/static logo component
 */
export default class Logo extends React.PureComponent {
    static propTypes = {
        /** On animation end event callback */
        onEnd: PropTypes.func,
        /** Logo size */
        size: PropTypes.number,
        /** Should animation run */
        animate: PropTypes.bool,
        /** Should animation loop */
        loop: PropTypes.bool,
        /** @ignore */
        themeName: PropTypes.string,
    };

    render() {
        const { size, loop, animate, onEnd, themeName } = this.props;
        return (
            <div className={css.logo} style={{ width: size, height: size }}>
                {!animate ? (
                    <Icon icon="iota" size={size} />
                ) : (
                    <Lottie
                        width={size}
                        height={size}
                        loop={loop}
                        data={getAnimation('loading', themeName)}
                        onEnd={onEnd}
                    />
                )}
            </div>
        );
    }
}
