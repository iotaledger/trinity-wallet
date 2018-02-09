import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import withCurrencyData from 'containers/settings/Currency';

import Button from 'ui/components/Button';
import Select from 'ui/components/input/Select';

/**
 * Change global currency settings
 */
class SetCurrency extends PureComponent {
    static propTypes = {
        /* Current currency */
        currency: PropTypes.string.isRequired,
        /* Available currency list */
        currencies: PropTypes.array.isRequired,
        /* Currency change statuss */
        loading: PropTypes.bool.isRequired,
        /* Set new currency
         * @param {string} currency - Currency code
         */
        setCurrency: PropTypes.func.isRequired,
        /* Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        selection: null,
    };

    render() {
        const { currency, currencies, loading, setCurrency, t } = this.props;
        const { selection } = this.state;

        return (
            <div>
                <Select
                    value={selection || currency}
                    label={t('currencySelection:currency')}
                    onChange={(e) => this.setState({ selection: e.target.value })}
                >
                    {currencies.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </Select>

                <Button
                    loading={loading}
                    disabled={!selection || selection === currency}
                    onClick={() => setCurrency(this.state.selection)}
                >
                    {t('global:save')}
                </Button>
            </div>
        );
    }
}

export default withCurrencyData(SetCurrency);
