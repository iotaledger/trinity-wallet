import React, { Component } from 'react';
import { round } from 'iota-wallet-shared-modules/libs/utils';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isValidAmount } from 'iota-wallet-shared-modules/libs/iota/utils';
import { getNextDenomination, getCurrencySymbol } from 'iota-wallet-shared-modules/libs/currency';
import CustomTextInput from './CustomTextInput';

class MultiTextInput extends Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        setAmount: PropTypes.func.isRequired,
        setDenomination: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        amount: PropTypes.string.isRequired,
        denomination: PropTypes.string.isRequired,
        currency: PropTypes.string.isRequired,
        multiplier: PropTypes.number.isRequired,
        conversionRate: PropTypes.number.isRequired,
        usdPrice: PropTypes.number.isRequired,
        onRef: PropTypes.func,
        label: PropTypes.string,
        containerStyle: PropTypes.object.isRequired,
        onSubmitEditing: PropTypes.func,
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
                onChangeText={(text) => this.onAmountType(text)}
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
    theme: state.settings.theme,
    currency: state.settings.currency,
    usdPrice: state.marketData.usdPrice,
    conversionRate: state.settings.conversionRate,
});

export default translate(['receive', 'global'])(connect(mapStateToProps, null)(MultiTextInput));
