import React from 'react';
import PropTypes from 'prop-types';
import css from './Input.css';

import Camera from 'images/camera.png';

export default class Input extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { value, onChange, placeholder } = this.props;

        return (
            <div className={css.input}>
                <input type="text" name="name" value={value} placeholder={placeholder} onChange={onChange} />
                <small />
            </div>
        );
    }
}
