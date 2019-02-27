import React, { Component } from 'react';
import { round } from 'shared-modules/libs/utils';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isValidAmount } from 'shared-modules/libs/iota/utils';
import { getNextDenomination, getCurrencySymbol } from 'shared-modules/libs/currency';
import { getThemeFromState } from 'shared-modules/selectors/global';
import CustomTextInput from './CustomTextInput';

class MultiTextInput extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** On change text event callback
         * @param {string}
         */
        setAmount: PropTypes.func.isRequired,
        /** On denomination press event callback
         * @param {string}
         */
        setDenomination: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Text entered in text field */
        amount: PropTypes.string.isRequired,
        /** Selected denomination */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** Multiplier used in converting IOTA denominations */
        multiplier: PropTypes.number.isRequired,
        /** @ignore */
        conversionRate: PropTypes.number.isRequired,
        /** @ignore */
        usdPrice: PropTypes.number.isRequired,
        /** Returns the rendered component instance
         * @param {object} instance - Component instance
         */
        onRef: PropTypes.func,
        /** Text field label */
        label: PropTypes.string,
        /** CustomTextField component container style */
        containerStyle: PropTypes.object,
        /** On submit editing event callback */
        onSubmitEditing: PropTypes.func,
        /** Determines if the text field is editable */
        editable: PropTypes.bool,
    };

    static defaultProps = {
        editable: true,
        onSubmitEditing: () => {},
        onRef: () => {},
        label: null,
    };

    /**
     *   Updates amount field.
     *
     *   @method onAmountType
     **/
    onAmountType(amount) {
        amount = amount.replace(/,/g, '.');
        this.props.setAmount(amount);
    }

    /**
     *   Updates selected denomination.
     *   @method onDenominationPress
     **/
    onDenominationPress() {
        const { currency, denomination } = this.props;
        const nextDenomination = getNextDenomination(currency, denomination);
        return this.props.setDenomination(nextDenomination);
    }

    /**
     *   Gets conversion text for amount field.
     *   Returns INVALID if specified amount is not valid.
     *   @method getConversionText
     *   @returns {string}
     **/
    getConversionText() {
        const { t, currency, amount, denomination, multiplier } = this.props;
        const currencySymbol = getCurrencySymbol(currency);
        const isFiat = denomination === currencySymbol;
        const amountIsValid = isValidAmount(amount, multiplier, isFiat);
        if (!amountIsValid && amount !== '') {
            return t('send:invalid');
        }
        if (denomination === currencySymbol) {
            return this.getConversionTextFiat();
        }
        return this.getConversionTextIOTA(currencySymbol);
    }

    /**
     *   Gets conversion text when fiat denomination is selected.
     *   @method getConversionTextFiat
     *   @returns {string}
     **/
    getConversionTextFiat() {
        const { amount, usdPrice, conversionRate } = this.props;
        const convertedValue = round(amount / usdPrice / conversionRate, 10);
        let conversionText = '';
        if (convertedValue > 0 && convertedValue < 0.01) {
            conversionText = '< 0.01 Mi';
        } else if (convertedValue >= 0.01) {
            conversionText = `= ${convertedValue.toFixed(2)} Mi`;
        }
        return conversionText;
    }

    /**
     *   Gets conversion text when IOTA denominations are selected.
     *   @method getConversionTextIOTA
     *   @returns {string}
     **/
    getConversionTextIOTA(currencySymbol) {
        const { amount, usdPrice, conversionRate, multiplier } = this.props;
        const convertedValue = round(parseFloat(amount) * usdPrice / 1000000 * multiplier * conversionRate, 10);
        let conversionText = '';
        if (convertedValue > 0 && convertedValue < 0.01) {
            conversionText = `< ${currencySymbol}0.01`;
        } else if (convertedValue >= 0.01) {
            conversionText = `= ${currencySymbol}${convertedValue.toFixed(2)}`;
        }
        return conversionText;
    }

    render() {
        const { theme, amount, denomination, onRef, label, containerStyle, onSubmitEditing, editable } = this.props;
        return (
            <CustomTextInput
                keyboardType="numeric"
                label={label}
                containerStyle={containerStyle}
                onRef={onRef}
                onValidTextChange={(text) => this.onAmountType(text)}
                autoCorrect={false}
                enablesReturnKeyAutomatically
                widget="denomination"
                conversionText={this.getConversionText()}
                currencyConversion
                theme={theme}
                denominationText={denomination}
                onDenominationPress={() => {
                    if (editable) {
                        this.onDenominationPress();
                    }
                }}
                value={amount}
                editable={editable}
                selectTextOnFocus={editable}
                onSubmitEditing={() => onSubmitEditing()}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    currency: state.settings.currency,
    usdPrice: state.marketData.usdPrice,
    conversionRate: state.settings.conversionRate,
});

export default withNamespaces(['receive', 'global'])(connect(mapStateToProps, null)(MultiTextInput));
