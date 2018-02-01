import React from 'react';
import PropTypes from 'prop-types';
import css from './Input.css';

export default class TextInput extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        label: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { value, label, onChange } = this.props;

        return (
            <div className={css.input}>
                <fieldset>
                    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
