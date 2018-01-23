import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getCurrencySymbol } from 'libs/currency';
import css from 'components/UI/input/Input.css';

import Chevron from 'images/chevron-down-white.png';

const units = ['$', 'i', 'Ki', 'Mi', 'Gi', 'Ti'];

export default class AddressInput extends React.PureComponent {
    static propTypes = {
        amount: PropTypes.string.isRequired,
        balance: PropTypes.number.isRequired,
        settings: PropTypes.object.isRequired,
        label: PropTypes.string.isRequired,
        labelMax: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        unit: 'Mi',
    };

    onChange = (value) => {
        value = value.replace(/,/g, '.');
        const trailingDot = value[value.length - 1] === '.' && value.match(/^\d+(\.\d{0,20})?$/g) ? '.' : '';
        value =
            !value.length || value.match(/^\d+(\.\d{0,20})?$/g) ? value * this.getUnitMultiplier() : this.props.amount;
        this.props.onChange(value + trailingDot);
    };

    getUnitMultiplier() {
        let multiplier = 1;
        switch (this.state.unit) {
            case 'i':
                break;
            case 'Ki':
                multiplier = 1000;
                break;
            case 'Mi':
                multiplier = 1000000;
                break;
            case 'Gi':
                multiplier = 1000000000;
                break;
            case 'Ti':
                multiplier = 1000000000000;
                break;
            case '$':
                multiplier = 1000000 * this.props.settings.conversionRate;
                break;
        }
        return multiplier;
    }

    maxAmount = (e) => {
        e.preventDefault();
        this.props.onChange(this.props.balance.toString());
    };

    unitChange = (e) => {
        e.preventDefault();

        const index = units.indexOf(this.state.unit) + 1;

        this.setState({
            unit: index === units.length ? units[0] : units[index],
        });
    };

    render() {
        const { amount, balance, settings, label, labelMax } = this.props;
        const { unit } = this.state;

        return (
            <div className={css.input}>
                <fieldset>
                    <a onClick={this.unitChange}>
                        <span>
                            {unit === '$' ? getCurrencySymbol(settings.currency) : unit}
                            <img src={Chevron} />
                        </span>
                    </a>
                    <input
                        type="text"
                        value={amount / this.getUnitMultiplier() + (amount[amount.length - 1] === '.' ? '.' : '')}
                        onChange={(e) => this.onChange(e.target.value)}
                    />
                    <small>{label}</small>
                </fieldset>
                <a
                    className={classNames(css.checkbox, parseInt(amount) === balance ? css.on : css.off)}
                    onClick={this.maxAmount}
                >
                    {labelMax}
                </a>
            </div>
        );
    }
}
