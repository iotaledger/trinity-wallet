import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './SeedGenerator.css';

export default class Letter extends React.PureComponent {
    static propTypes = {
        index: PropTypes.number,
        value: PropTypes.string,
        onClick: PropTypes.func,
        updated: PropTypes.number.isRequired,
    };

    render() {
        const { onClick, index, value, updated } = this.props;

        const updateClass = updated < 5 ? `updated_${updated}` : 'updated_alot';

        return (
            <button
                type="button"
                data-index={index}
                className={classNames(css.letter, css[updateClass])}
                onClick={onClick}
            >
                <span>{value}</span>
            </button>
        );
    }
}
