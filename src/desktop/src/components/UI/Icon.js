import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { icons } from 'icons/icons';

import css from './Icon.css';

export default class Icon extends React.PureComponent {
    static propTypes = {
        size: PropTypes.number,
        icon: PropTypes.string.isRequired,
        color: PropTypes.string,
    };

    render() {
        const { size, icon, color } = this.props;
        return (
            <span className={classNames(css.icon, css[icon])} style={{ fontSize: size || 32, color: color }}>
                {icons[icon]}
            </span>
        );
    }
}
