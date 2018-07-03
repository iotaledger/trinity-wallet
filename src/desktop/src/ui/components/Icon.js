import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import icons from 'icons/icons';

import css from './icon.scss';

/**
 * Icon component
 */
export default class Icon extends React.PureComponent {
    static propTypes = {
        /** Icon type */
        icon: PropTypes.oneOf(Object.keys(icons).concat(['seedVault'])).isRequired,
        /** Icon size in pixels */
        size: PropTypes.number,
        /** Icon fill color */
        color: PropTypes.string,
    };

    render() {
        const { size, icon, color } = this.props;

        if (icon === 'seedVault') {
            return (
                <svg
                    width={size}
                    height={size}
                    className={css.seedVault}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 170 180"
                >
                    <path
                        className={css.fg}
                        d="M167.8 27.8c-8.3 0-23-1.8-46-10.3-14.3-5.3-28.6-12-36.4-17.3-.3-.2-.6-.3-.9-.3-.3 0-.6.1-.9.3-7.8 5.3-22.1 12-36.4 17.3-23 8.5-37.7 10.3-46 10.3-.9 0-1.7.8-1.7 1.7 0 46.9 17.1 82 31.5 103.2 15.7 23.1 36.5 41.6 52.9 47.1.2.1.3.1.5.1s.3 0 .5-.1c16.4-5.5 37.2-24 52.9-47.1 14.4-21.2 31.5-56.3 31.5-103.2.1-.9-.6-1.7-1.5-1.7z"
                    />
                    <path
                        className={css.bg}
                        d="M132.7 129.1c-16.4 24.1-35.7 39.3-48.2 44.2-12.5-4.9-31.9-20-48.2-44.2-13.5-19.7-29.4-52.1-30.5-95.1 15.1-.9 31.9-6.2 43.8-10.6 13.1-4.9 26.4-11.1 34.9-16.3 8.5 5.2 21.7 11.4 34.9 16.3 11.9 4.4 28.7 9.6 43.8 10.6-1.1 43-17.1 75.4-30.5 95.1z"
                    />
                    <path
                        className={css.mg}
                        d="M84.4 173.7c-12.5-4.9-31.9-20-48.2-44.2-13.4-19.8-29.3-52.1-30.4-95.1 15.1-.9 31.9-6.2 43.8-10.6 13.1-4.9 26.4-11.2 34.9-16.3"
                    />
                    <path
                        className={css.fg}
                        d="M101.1 70.1c8.9-8.8 9-23.2.3-32.2s-23.1-9.1-32-.3c-8.9 8.8-9 23.2-.3 32.2 3.4 3.5 7.7 5.6 12.1 6.4l-.6 69.3c0 1.3 1 2.3 2.2 2.3.6 0 1.2-.2 1.6-.6s.7-1 .7-1.6l.1-7.4 10.6.1c.6 0 1.2-.2 1.6-.6s.7-1 .7-1.6c0-1.3-1-2.3-2.2-2.3l-10.6-.1.1-5.1 10.6.1c.6 0 1.2-.2 1.6-.6.4-.4.7-1 .7-1.6 0-1.3-1-2.3-2.2-2.3l-10.8-.2.4-47.4c5.6-.1 11.1-2.3 15.4-6.5zm-16 1.9c-4.9 0-9.4-2-12.8-5.4-3.4-3.5-5.2-8.1-5.2-12.9 0-4.9 2-9.4 5.4-12.8 3.5-3.4 8-5.3 12.9-5.2 4.9 0 9.4 2 12.8 5.4 3.4 3.5 5.2 8.1 5.2 12.9 0 4.9-2 9.4-5.4 12.8-3.5 3.4-8 5.3-12.9 5.2z"
                    />
                </svg>
            );
        }

        return (
            <span
                className={classNames(css.icon, css[icon])}
                style={{ fontSize: size || 32, lineHeight: size ? `${size}px` : 32, color: color || null }}
            >
                {icons[icon]}
            </span>
        );
    }
}
