import isNull from 'lodash/isNull';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import {
    hasCompletedBasicIdentityVerification,
    hasCompletedAdvancedIdentityVerification,
    isLimitIncreaseAllowed,
    getDefaultCurrencyCode,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    shouldRequireStateInput,
    hasStoredAnyPaymentCards,
} from 'selectors/exchanges/MoonPay';
import { getAmountInFiat, convertFiatCurrency } from 'exchanges/MoonPay/utils';
import { generateAlert } from 'actions/alerts';
import { updateCustomer, updateCustomerInfo } from 'actions/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay user advanced info screen component */
class UserAdvancedInfo extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        isUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        address: PropTypes.string,
        /** @ignore */
        city: PropTypes.string,
        /** @ignore */
        country: PropTypes.string,
        /** @ignore */
        zipCode: PropTypes.string,
        /** @ignore */
        state: PropTypes.string,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateCustomer: PropTypes.func.isRequired,
        /** @ignore */
        shouldRequireStateInput: PropTypes.bool.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        hasAnyPaymentCards: PropTypes.bool.isRequired,
        /** @ignore */
        updateCustomerInfo: PropTypes.func.isRequired,
    };

    state = {
        address: isNull(this.props.address) ? '' : this.props.address,
        city: isNull(this.props.city) ? '' : this.props.city,
        zipCode: isNull(this.props.zipCode) ? '' : this.props.zipCode,
        state: isNull(this.props.state) ? '' : this.props.state,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.isUpdatingCustomer && !nextProps.isUpdatingCustomer && !nextProps.hasErrorUpdatingCustomer) {
            this.redirect(nextProps);
        }
    }

    /**
     * Navigates to the relevant screen
     *
     * @method redirect
     */
    redirect(props) {
        const {
            isPurchaseLimitIncreaseAllowed,
            hasCompletedBasicIdentityVerification,
            hasCompletedAdvancedIdentityVerification,
            dailyLimits,
            monthlyLimits,
            amount,
            denomination,
            exchangeRates,
            defaultCurrencyCode,
        } = props;

        const fiatAmount = getAmountInFiat(Number(amount), denomination, exchangeRates);

        const purchaseAmount = convertFiatCurrency(
            fiatAmount,
            exchangeRates,
            denomination,
            // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
            defaultCurrencyCode,
        );

        const nextRoute = `/exchanges/moonpay/${
            hasCompletedBasicIdentityVerification &&
            !isPurchaseLimitIncreaseAllowed &&
            hasCompletedAdvancedIdentityVerification &&
            (purchaseAmount > dailyLimits.dailyLimitRemaining || purchaseAmount > monthlyLimits.monthlyLimitRemaining)
                ? 'purchase-limit-warning'
                : 'add-payment-method'
        }`;

        this.props.history.push(nextRoute);
    }

    /**
     * Updates customer information
     *
     * @method updateCustomer
     *
     * @returns {function}
     */
    updateCustomer() {
        const { hasAnyPaymentCards, shouldRequireStateInput, country, t } = this.props;

        if (!this.state.address) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidAddress'),
                t('moonpay:invalidAddressExplanation'),
            );
        }

        if (shouldRequireStateInput && !this.state.state) {
            return this.props.generateAlert('error', t('moonpay:invalidState'), t('moonpay:invalidStateExplanation'));
        }

        if (!this.state.city) {
            return this.props.generateAlert('error', t('moonpay:invalidCity'), t('moonpay:invalidCityExplanation'));
        }

        if (!this.state.zipCode) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidZipCode'),
                t('moonpay:invalidZipCodeExplanation'),
            );
        }

        const data = {
            address: {
                country,
                street: this.state.address,
                town: this.state.city,
                postCode: this.state.zipCode,
                ...(shouldRequireStateInput && { state: this.state.state }),
            },
        };

        if (hasAnyPaymentCards) {
            this.props.updateCustomerInfo(data);
            return this.redirect(this.props);
        }

        return this.props.updateCustomer(data);
    }

    render() {
        const { shouldRequireStateInput, t } = this.props;
        const { address, city, state, zipCode } = this.state;

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <p> {t('moonpay:tellUsMore')}</p>
                        <p>{t('moonpay:cardRegistrationName')}</p>
                    </div>
                    <fieldset>
                        <Input
                            value={address}
                            label={t('moonpay:address')}
                            onChange={(newAddress) => this.setState({ address: newAddress })}
                        />
                        {shouldRequireStateInput && (
                            <Input
                                value={state}
                                label={t('moonpay:state')}
                                onChange={(newState) => this.setState({ state: newState })}
                            />
                        )}
                        {shouldRequireStateInput ? (
                            <span>
                                <Input
                                    value={city}
                                    label={t('moonpay:city')}
                                    onChange={(newCity) => this.setState({ city: newCity })}
                                />
                                <Input
                                    value={zipCode}
                                    label={t('moonpay:zipCode')}
                                    onChange={(newZipCode) => this.setState({ zipCode: newZipCode })}
                                />
                            </span>
                        ) : (
                            <div>
                                <Input
                                    value={city}
                                    label={t('moonpay:city')}
                                    onChange={(newCity) => this.setState({ city: newCity })}
                                />
                                <Input
                                    value={zipCode}
                                    label={t('moonpay:zipCode')}
                                    onChange={(newZipCode) => this.setState({ zipCode: newZipCode })}
                                />
                            </div>
                        )}
                    </fieldset>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            id="to-add-payment-method"
                            onClick={() => this.updateCustomer()}
                            className="square"
                            variant="primary"
                        >
                            {t('global:continue')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    address: state.exchanges.moonpay.customer.address.street,
    city: state.exchanges.moonpay.customer.address.town,
    country: state.exchanges.moonpay.customer.address.country,
    zipCode: state.exchanges.moonpay.customer.address.postCode,
    state: state.exchanges.moonpay.customer.address.state,
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    hasCompletedBasicIdentityVerification: hasCompletedBasicIdentityVerification(state),
    hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
    isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    shouldRequireStateInput: shouldRequireStateInput(state),
    hasAnyPaymentCards: hasStoredAnyPaymentCards(state),
});

const mapDispatchToProps = {
    generateAlert,
    updateCustomer,
    updateCustomerInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UserAdvancedInfo));
