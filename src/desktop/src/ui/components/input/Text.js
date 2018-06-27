import React from 'react';
import PropTypes from 'prop-types';
import css from './input.scss';

/**
 * Single line input component
 */
export default class Text extends React.PureComponent {
    static propTypes = {
        /** Current input value */
        value: PropTypes.string.isRequired,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
        /** Input label */
        label: PropTypes.string,
        /** Address change event function
         * @param {string} value - Current input value
         */
        onChange: PropTypes.func.isRequired,
    };

    componentDidMount() {
        if (this.props.focus) {
            this.input.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.focus && nextProps.focus) {
            this.input.focus();
        }
    }

    render() {
        const { value, label, onChange } = this.props;

        return (
            <div className={css.input}>
                <fieldset>
                    <input
                        ref={(input) => {
                            this.input = input;
                        }}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
