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
        state: PropTypes.string,
        /** @ignore */
        zipCode: PropTypes.string,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateCustomer: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        hasAnyPaymentCards: PropTypes.bool.isRequired,
        /** @ignore */
        updateCustomerInfo: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            address: isNull(props.address) ? '' : props.address,
            city: isNull(props.city) ? '' : props.city,
            zipCode: isNull(props.zipCode) ? '' : props.zipCode,
        };
    }

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
        const { state, hasAnyPaymentCards, country, t } = this.props;

        if (!this.state.address) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidAddress'),
                t('moonpay:invalidAddressExplanation'),
            );
        }

        if (!this.state.city) {
            return this.props.generateAlert('error', t('moonpay:invalidCity'), t('moonpay:invalidCityExplanation'));
        }

        if (!this.state.zipCode) {
            return this.props.generateAlert(
                'error',
                country === 'USA' ? 'Invalid zip code' : t('moonpay:invalidZipCode'),
                country === 'USA' ? 'Please enter a valid zip code.' : t('moonpay:invalidZipCodeExplanation'),
            );
        }

        const data = {
            address: {
                country,
                state,
                street: this.state.address,
                town: this.state.city,
                postCode: this.state.zipCode,
            },
        };
        if (hasAnyPaymentCards) {
            this.props.updateCustomerInfo(data);
            return this.redirect(this.props);
        }

        return this.props.updateCustomer(data);
    }

    render() {
        const { t, country, hasAnyPaymentCards } = this.props;
        const { address, city, zipCode } = this.state;

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <p> {t('moonpay:tellUsMore')}</p>
                        <p>{t('moonpay:cardBillingAddress')}</p>
                    </div>
                    <fieldset>
                        <Input
                            value={address}
                            label={t('moonpay:address')}
                            onChange={(newAddress) => this.setState({ address: newAddress })}
                        />
                        <Input
                            value={city}
                            label={t('moonpay:city')}
                            onChange={(newCity) => this.setState({ city: newCity })}
                        />
                        <Input
                            value={zipCode}
                            label={country === 'USA' ? 'ZIP CODE' : t('moonpay:zipCode')}
                            onChange={(newZipCode) => this.setState({ zipCode: newZipCode })}
                        />
                    </fieldset>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() =>
                                this.props.history.push(
                                    hasAnyPaymentCards
                                        ? '/exchanges/moonpay/select-payment-card'
                                        : '/exchanges/moonpay/user-basic-info',
                                )
                            }
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
    state: state.exchanges.moonpay.customer.address.state,
    country: state.exchanges.moonpay.customer.address.country,
    zipCode: state.exchanges.moonpay.customer.address.postCode,
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    hasCompletedBasicIdentityVerification: hasCompletedBasicIdentityVerification(state),
    hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
    isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    hasAnyPaymentCards: hasStoredAnyPaymentCards(state),
});

const mapDispatchToProps = {
    generateAlert,
    updateCustomer,
    updateCustomerInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UserAdvancedInfo));
