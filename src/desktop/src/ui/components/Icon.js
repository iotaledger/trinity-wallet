import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { icons } from 'icons/icons';

import css from './icon.css';

/**
 * Icon component
 */
export default class Icon extends React.PureComponent {
    static propTypes = {
        /* Icon type */
        icon: PropTypes.oneOf(Object.keys(icons)).isRequired,
        /* Icon size in pixels */
        size: PropTypes.number,
        /* Icon fill color */
        color: PropTypes.string,
    };

    render() {
        const { size, icon, color } = this.props;
        return (
            <span
                className={classNames(css.icon, css[icon])}
                style={{ fontSize: size || 32, color: color || 'inherit' }}
            >
                {icons[icon]}
            </span>
        );
    }
}
