import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { getCurrencyData } from '../../actions/settings';

import { getThemeFromState } from '../../selectors/global';

/**
 * Currency settings container
 * @ignore
 */
export default function withCurrencyData(CurrencyComponent) {
    class CurrencyData extends React.Component {
        static propTypes = {
            isFetchingCurrencyData: PropTypes.bool.isRequired,
            hasErrorFetchingCurrencyData: PropTypes.bool.isRequired,
            currentCurrency: PropTypes.string.isRequired,
            availableCurrencies: PropTypes.arrayOf(PropTypes.string).isRequired,
            getCurrencyData: PropTypes.func.isRequired,
            backPress: PropTypes.func,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
        };

        componentWillReceiveProps(nextProps) {
            const props = this.props;

            if (
                typeof props.backPress === 'function' &&
                props.isFetchingCurrencyData &&
                !nextProps.isFetchingCurrencyData
            ) {
                props.backPress();
            }
        }

        changeCurrency = (currency) => {
            this.props.getCurrencyData(currency, true);
        };

        render() {
            const { theme, t, isFetchingCurrencyData, availableCurrencies, currentCurrency, backPress } = this.props;

            const currencyProps = {
                loading: isFetchingCurrencyData,
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
        isFetchingCurrencyData: state.ui.isFetchingCurrencyData,
        hasErrorFetchingCurrencyData: state.ui.hasErrorFetchingCurrencyData,
        currentCurrency: state.settings.currency,
        availableCurrencies: state.settings.availableCurrencies,
        theme: getThemeFromState(state),
    });

    const mapDispatchToProps = {
        getCurrencyData,
    };

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(CurrencyData));
}
