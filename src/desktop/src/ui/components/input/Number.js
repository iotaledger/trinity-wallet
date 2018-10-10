import React from 'react';
import PropTypes from 'prop-types';
import css from './input.scss';

/**
 * Single number input component
 */
export default class Number extends React.PureComponent {
    static propTypes = {
        /** Current input value */
        value: PropTypes.number.isRequired,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
        /** Input label */
        label: PropTypes.string,
        /** Value change event function
         * @param {number} value - Current input value
         */
        onChange: PropTypes.func.isRequired
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
                        type="number"
                        value={value}
                        min="1"
                        onChange={(e) => onChange(parseInt(e.target.value))}
                    />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }
}
