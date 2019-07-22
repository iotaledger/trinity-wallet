/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';

import css from './titlebar.scss';

/**
 * Windows platform wallet titlebar component
 */
const Titlebar = ({ path }) => {
    const os = Electron.getOS();

    const sidebarViews = ['wallet', 'settings'];

    const windows = () => {
        return (
            <nav className={css.windows}>
                <a
                    className={sidebarViews.indexOf(path) > -1 ? css.dark : css.light}
                    onClick={() => Electron.showMenu()}
                >
                    <svg width="15" height="15" viewBox="0 0 15 15">
                        <path fill="#000" d="M0 1h15v1h-15z" />
                        <path fill="#000" d="M0 7h15v1h-15z" />
                        <path fill="#000" d="M0 13h15v1h-15z" />
                    </svg>
                </a>
                <a onClick={() => Electron.minimize()}>
                    <svg width="15" height="15" viewBox="0 0 15 15">
                        <path fill="#000" d="M0 12h15v1h-15z" />
                    </svg>
                </a>
                <a onClick={() => Electron.maximize()}>
                    <svg width="15" height="15" viewBox="0 0 15 15">
                        <path d="M1 1v13h13v-13h-13zm-1-1h15v15h-15v-15z" />
                    </svg>
                </a>
                <a onClick={() => Electron.close()}>
                    <svg width="15" height="15" viewBox="0 0 15 15">
                        <path d="M7.425 6.718l6.718-6.718.707.707-6.718 6.718 6.718 6.718-.707.707-6.718-6.718-6.718 6.718-.707-.707 6.718-6.718-6.718-6.718.707-.707 6.718 6.718z" />
                    </svg>
                </a>
            </nav>
        );
    };

    return <div className={css.titlebar}>{os === 'win32' ? windows() : null}</div>;
};

Titlebar.propTypes = {
    /** Current main path */
    path: PropTypes.string.isRequired,
};

export default Titlebar;
