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
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        currencies: PropTypes.arrayOf(PropTypes.string).isRequired,
        /** @ignore */
        loading: PropTypes.bool.isRequired,
        /** @ignore */
        setCurrency: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        selection: null,
    };

    render() {
        const { currency, currencies, loading, setCurrency, t } = this.props;
        const { selection } = this.state;

        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setCurrency(this.state.selection);
                }}
            >
                <fieldset>
                    <Select
                        value={selection || currency}
                        label={t('currencySelection:currency')}
                        onChange={(value) => this.setState({ selection: value })}
                        options={currencies
                            .slice()
                            .sort()
                            .map((item) => {
                                return { value: item, label: item };
                            })}
                    />
                </fieldset>
                <footer>
                    <Button
                        className="square"
                        disabled={!selection || selection === currency}
                        type="submit"
                        loading={loading}
                    >
                        {t('save')}
                    </Button>
                </footer>
            </form>
        );
    }
}

export default withCurrencyData(SetCurrency);
