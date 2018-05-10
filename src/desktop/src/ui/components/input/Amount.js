import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { formatIota } from 'libs/iota/utils';
import { round } from 'libs/utils';
import { getCurrencySymbol } from 'libs/currency';

import Icon from 'ui/components/Icon';
import css from './input.scss';

const units = ['i', 'Ki', 'Mi', 'Gi', 'Ti', '$'];
const decimals = [0, 3, 6, 9, 12, 2];

/**
 * Ammount input component
 */
export default class AmountInput extends React.PureComponent {
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
        value: 0,
        iotas: 0,
    };

    componentWillMount() {
        this.stateToProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.stateToProps(nextProps);
    }

    onChange = (value) => {
        // Replace , with . and remove leading zeros
        value = value.replace(/,/g, '.').replace(/^0+(?=\d)/, '');

        // Ignore invalid or empty input
        if (!value.length) {
            value = '0';
        } else if (!value.match(/^\d+(\.\d{0,20})?$/g)) {
            return;
        }

        // Strip to max allowed decimals
        if (value.indexOf('.') > 0) {
            value = value.substr(0, value.indexOf('.') + decimals[units.indexOf(this.state.unit)] + 1);
        }

        // Convert to iotas
        const iotas = round(value * this.getUnitMultiplier());

        this.setState(
            {
                value: value,
                iotas: iotas,
            },
            () => this.props.onChange(String(iotas)),
        );
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

    stateToProps = (props) => {
        if (this.state.iotas !== parseInt(props.amount)) {
            this.setState({
                iotas: props.amount.length ? parseInt(props.amount) : 0,
                value: this.toUnits(props.amount, this.state.unit),
            });
        }
    };

    maxAmount = () => {
        const { amount, balance } = this.props;
        const total = balance === parseInt(amount) ? 0 : balance;
        this.props.onChange(String(total));
    };

    toUnits = (iotas, unit) => {
        let value = (round(iotas / this.getUnitMultiplier(unit) * 1000000000000) / 1000000000000)
            .toFixed(decimals[units.indexOf(unit)])
            .toString();

        if (value.indexOf('.') > 0) {
            // Remove reailing zeros and/or dot
            value = value.replace(/(?=\d)0+$/, '').replace(/\.$/, '');
        }
        return value;
    };

    unitChange = (unit) => {
        if (unit === this.state.unit) {
            return;
        }

        this.setState({
            unit: unit,
            value: this.toUnits(this.props.amount, unit),
        });
    };

    render() {
        const { amount, balance, settings, label, labelMax } = this.props;
        const { value, unit } = this.state;

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
                                            onClick={() => this.unitChange(item)}
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
                    <input type="text" value={value} onChange={(e) => this.onChange(e.target.value)} />
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
