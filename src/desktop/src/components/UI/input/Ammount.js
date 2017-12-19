import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getCurrencySymbol } from 'libs/currency';
import css from './Ammount.css';
import Button from 'components/UI/Button';

const units = ['$', 'i', 'Ki', 'Mi', 'Gi', 'Ti'];

export default class AddressInput extends React.PureComponent {
    static propTypes = {
        ammount: PropTypes.string.isRequired,
        balance: PropTypes.number.isRequired,
        settings: PropTypes.object.isRequired,
    };

    state = {
        unit: 'Mi',
    };

    unitChange = e => {
        e.preventDefault();

        const index = units.indexOf(this.state.unit) + 1;

        this.setState({
            unit: index === units.length ? units[0] : units[index],
        });
    };

    maxAmmount = e => {
        e.preventDefault();
        this.props.onChange(this.props.balance.toString());
    };

    onChange = value => {
        value = value.replace(/,/g, '.');
        const trailingDot = value[value.length - 1] === '.' && value.match(/^\d+(\.\d{0,20})?$/g) ? '.' : '';
        value =
            !value.length || value.match(/^\d+(\.\d{0,20})?$/g) ? value * this.getUnitMultiplier() : this.props.ammount;
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

    render() {
        const { ammount, settings } = this.props;
        const { unit } = this.state;

        return (
            <div className={css.ammountInput}>
                <div>
                    <input
                        type="text"
                        value={ammount / this.getUnitMultiplier() + (ammount[ammount.length - 1] === '.' ? '.' : '')}
                        onChange={e => this.onChange(e.target.value)}
                    />
                    <small />
                </div>
                <Button onClick={this.unitChange}>{unit === '$' ? getCurrencySymbol(settings.currency) : unit}</Button>
                <Button onClick={this.maxAmmount}>Max</Button>
            </div>
        );
    }
}
