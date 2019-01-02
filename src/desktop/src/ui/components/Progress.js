import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import css from './progress.scss';

/**
 * Progress bar component
 */
export default class Progress extends React.PureComponent {
    static propTypes = {
        /** Progress bar progress */
        progress: PropTypes.number.isRequired,
        /** Progress bar title */
        title: PropTypes.string,
        /** Progress bar subtitle */
        subtitle: PropTypes.string,
        /** Progress bar style type */
        type: PropTypes.oneOf(['large']),
    };

    render() {
        const { progress, title, subtitle, type } = this.props;

        return (
            <div className={classNames(css.progress, type ? css[type] : null)}>
                {title && <p>{title}</p>}
                <div>
                    <div style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                {subtitle && <small>{subtitle}</small>}
            </div>
        );
    }
}
