import React from 'react';
import PropTypes from 'prop-types';
import css from './progress.css';

/**
 * Progress bar component
 */
export default class Progress extends React.PureComponent {
    static propTypes = {
        /** Progress bar progress */
        progress: PropTypes.number.isRequired,
        /** Progress bar title */
        title: PropTypes.string,
    };

    render() {
        const { progress, title } = this.props;

        return (
            <div className={css.progress}>
                <p>{title || ''}</p>
                <div>
                    <div style={{ width: `${progress}%` }} />
                </div>
            </div>
        );
    }
}
