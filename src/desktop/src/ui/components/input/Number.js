import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import css from './input.scss';

import Icon from 'ui/components/Icon';

/**
 * Single number input component
 */
export default class Number extends React.PureComponent {
    static propTypes = {
        /** Current input value */
        value: PropTypes.number.isRequired,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
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
        const { value, onChange } = this.props;

        return (
            <div className={classNames(css.input, css.number)}>
                <fieldset>
                    <div>
                        <span onClick={() => onChange(Math.max(0, value - 1))}>
                            <Icon icon="chevronLeft" size={16} />
                        </span>
                        <input
                            ref={(input) => {
                                this.input = input;
                            }}
                            type="number"
                            value={value}
                            min="0"
                            onChange={(e) => onChange(parseInt(e.target.value))}
                        />
                        <span onClick={() => onChange(value + 1)}>
                            <Icon icon="chevronRight" size={16} />
                        </span>
                    </div>
                </fieldset>
            </div>
        );
    }
}
