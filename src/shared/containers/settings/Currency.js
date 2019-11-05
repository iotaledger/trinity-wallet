import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setCurrency } from '../../actions/settings';

import { getThemeFromState } from '../../selectors/global';

/**
 * Currency settings container
 * @ignore
 */
export default function withCurrencyData(CurrencyComponent) {
    class CurrencyData extends React.Component {
        static propTypes = {
            currentCurrency: PropTypes.string.isRequired,
            availableCurrencies: PropTypes.arrayOf(PropTypes.string).isRequired,
            setCurrency: PropTypes.func.isRequired,
            backPress: PropTypes.func,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
        };

        changeCurrency = (currency) => {
            this.props.setCurrency(currency);
        };

        render() {
            const { theme, t, availableCurrencies, currentCurrency, backPress } = this.props;

            const currencyProps = {
                currencies: availableCurrencies,
                currency: currentCurrency,
                setCurrency: this.changeCurrency,
                backPress: backPress,
                theme,
                t,
            };

            return <CurrencyComponent {...currencyProps} />;
        }
    }

    CurrencyData.displayName = `withCurrencyData(${CurrencyComponent.name})`;

    const mapStateToProps = (state) => ({
        currentCurrency: state.settings.currency,
        availableCurrencies: Object.keys(state.marketData.rates),
        theme: getThemeFromState(state),
    });

    const mapDispatchToProps = {
        setCurrency,
    };

    return connect(
        mapStateToProps,
        mapDispatchToProps,
    )(CurrencyData);
}
