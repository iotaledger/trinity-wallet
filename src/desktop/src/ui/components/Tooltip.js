import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'ui/components/Icon';
import css from './tooltip.scss';

/**
 * Tooltip component
 */
export default class Tooltip extends React.PureComponent {
    static propTypes = {
        /** Tooltip text */
        tip: PropTypes.string.isRequired,
        /** Optional tooltip title */
        title: PropTypes.string,
    };

    render() {
        return (
            <div className={css.tooltip}>
                <Icon icon="info" size={21} />
                <div>
                    {this.props.title ? <strong>{this.props.title}</strong> : null}
                    <em>{this.props.tip}</em>
                </div>
            </div>
        );
    }
}
