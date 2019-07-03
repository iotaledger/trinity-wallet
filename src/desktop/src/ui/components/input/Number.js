import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import Icon from 'ui/components/Icon';

import css from './input.scss';

/**
 * Single number input component
 */
export default class Number extends React.PureComponent {
    static propTypes = {
        /** Is input inline style */
        inline: PropTypes.bool,
        /** Is input disabled */
        disabled: PropTypes.bool,
        /** Number input label */
        label: PropTypes.string,
        /** Current input value */
        value: PropTypes.number.isRequired,
        /** Min valid value */
        min: PropTypes.number,
        /** Max valid value */
        max: PropTypes.number,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
        /** Value change event function
         * @param {number} value - Current input value
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

    onInput(input) {
        const { min, max, onChange, value } = this.props;

        if (isNaN(input)) {
            input = value;
        }

        if (typeof min === 'number') {
            input = Math.max(input, min);
        }

        if (typeof max === 'number') {
            input = Math.min(input, max);
        }

        onChange(input);
    }

    render() {
        const { disabled, label, inline, value } = this.props;

        return (
            <div className={classNames(css.input, css.number, inline && css.inline, disabled && css.disabled)}>
                <fieldset>
                    <div>
                        <small>{label}</small>
                        <span onClick={() => this.onInput(value - 1)}>
                            <Icon icon="chevronLeft" size={inline ? 9 : 12} />
                        </span>
                        <input
                            ref={(input) => {
                                this.input = input;
                            }}
                            type="number"
                            value={value}
                            min="0"
                            onChange={(e) => this.onInput(parseInt(e.target.value))}
                        />
                        <span onClick={() => this.onInput(value + 1)}>
                            <Icon icon="chevronRight" size={inline ? 9 : 12} />
                        </span>
                    </div>
                </fieldset>
            </div>
        );
    }
}
