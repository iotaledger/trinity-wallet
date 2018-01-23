import React from 'react';
import PropTypes from 'prop-types';
import css from './Input.css';

export default class Select extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        label: PropTypes.string,
    };

    render() {
        const { children, label } = this.props;

        return (
            <div className={css.input}>
                <fieldset>
                    <a className={css.down}>&shy;</a>
                    <select {...this.props}>{children}</select>
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
