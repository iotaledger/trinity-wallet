import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import css from './tab.scss';

/**
 * Tab component
 */
export default class Tab extends React.PureComponent {
    static propTypes = {
        /** Tab text */
        children: PropTypes.string.isRequired,
        /** Determines whether the tab is active */
        active: PropTypes.bool,
        /** @ignore */
        onClick: PropTypes.func.isRequired,
    };

    static defaultProps = {
        active: false,
    };

    render() {
        const { children, active, onClick } = this.props;

        return (
            <span className={classNames(css.tab, active ? css.active : null)} onClick={onClick}>
                {children}
            </span>
        );
    }
}
