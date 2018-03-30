import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatIota, round } from 'libs/util';
import { getCurrencySymbol } from 'libs/currency';

import Icon from 'ui/components/Icon';
import css from './input.css';

const units = ['i', 'Ki', 'Mi', 'Gi', 'Ti', '$'];

/**
 * Ammount input component
 */
export default class AddressInput extends React.PureComponent {
    static propTypes = {
        /** Current ammount value */
        amount: PropTypes.string.isRequired,
        /** Max available ammount */
        balance: PropTypes.number.isRequired,
        /** Fiat currency settings
         * @property {string} conversionRate - Active currency conversion rate to MIota
         * @property {string} currency - Active currency name
         * @property {string} usdPrice - Current USD price per Miota
         */
        settings: PropTypes.shape({
            conversionRate: PropTypes.number.isRequired,
            currency: PropTypes.string.isRequired,
            usdPrice: PropTypes.number.isRequired,
        }).isRequired,
        /** Ammount input label */
        label: PropTypes.string.isRequired,
        /** Max ammount controller label */
        labelMax: PropTypes.string.isRequired,
        /** Ammount change event function
         * @param {string} value - Current ammount value
         */
        onChange: PropTypes.func.isRequired,
    };

    state = {
        unit: 'Mi',
    };

    onChange = (value) => {
        value = value.replace(/,/g, '.');

        if (this.state.unit === 'i' && value.indexOf('.') > -1) {
            return;
        }

        const trailingDot = value[value.length - 1] === '.' && value.match(/^\d+(\.\d{0,20})?$/g) ? '.' : '';
        value =
            !value.length || value.match(/^\d+(\.\d{0,20})?$/g)
                ? round(value * this.getUnitMultiplier())
                : this.props.amount;

        this.props.onChange(value + trailingDot);
    };

    getUnitMultiplier(unit) {
        let multiplier = 1;
        const target = unit || this.state.unit;
        switch (target) {
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
                multiplier = 1000000 / (this.props.settings.usdPrice * this.props.settings.conversionRate);
                break;
        }
        return multiplier;
    }

    maxAmount = () => {
        const { amount, balance } = this.props;

        const total = balance === parseInt(amount) ? '0' : balance.toString();

        this.props.onChange(total);
    };

    unitChange = (unit) => {
        const { amount, settings } = this.props;

        if (unit === '$') {
            const fiat = round(amount * settings.usdPrice / 1000000 * settings.conversionRate * 100) / 100;
            this.props.onChange(round(fiat / settings.usdPrice));
        }

        this.setState({
            unit: unit,
        });
    };

    render() {
        const { amount, balance, settings, label, labelMax } = this.props;
        const { unit } = this.state;

        return (
            <div className={css.input}>
                <fieldset>
                    <a>
                        <strong>
                            {unit === '$' ? getCurrencySymbol(settings.currency) : unit}
                            <Icon icon="chevronDown" size={8} />
                            <ul className={css.dropdown}>
                                {units.map((item) => {
                                    return (
                                        <li
                                            key={item}
                                            className={item === unit ? css.selected : null}
                                            onClick={() => this.setState({ unit: item })}
                                        >
                                            {item === '$' ? getCurrencySymbol(settings.currency) : item}
                                        </li>
                                    );
                                })}
                            </ul>
                        </strong>
                        {amount > 0 && unit !== '$' ? (
                            <p>
                                = {getCurrencySymbol(settings.currency)}{' '}
                                {(
                                    round(amount * settings.usdPrice / 1000000 * settings.conversionRate * 100) / 100
                                ).toFixed(2)}
                            </p>
                        ) : null}
                        {amount > 0 && unit === '$' ? <p>= {formatIota(amount)}</p> : null}
                    </a>
                    <input
                        type="text"
                        value={
                            round(amount / this.getUnitMultiplier() * 1000000) / 1000000 +
                            (amount[amount.length - 1] === '.' ? '.' : '')
                        }
                        onChange={(e) => this.onChange(e.target.value)}
                    />
                    <small>{label}</small>
                </fieldset>
                {balance > 0 && (
                    <a
                        className={classNames(css.checkbox, parseInt(amount) === balance ? css.on : css.off)}
                        onClick={this.maxAmount}
                    >
                        {labelMax}
                    </a>
                )}
            </div>
        );
    }
}
