import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import head from 'lodash/head';
import map from 'lodash/map';
import toLower from 'lodash/toLower';
import size from 'lodash/size';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { fetchMeta, setTransactionActive } from 'actions/exchanges/MoonPay';

import {
    prepareMoonPayExternalLink,
    getAmountInFiat,
    getActiveFiatCurrency,
    convertFiatCurrency,
} from 'exchanges/MoonPay/utils';
import {
    getCustomerEmail,
    getDefaultCurrencyCode,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    hasCompletedAdvancedIdentityVerification,
    isLimitIncreaseAllowed,
    getAllTransactions,
} from 'selectors/exchanges/MoonPay';
import { getLatestAddressForMoonPaySelectedAccount } from 'selectors/accounts';

import Button from 'ui/components/Button';

import css from './index.scss';

/** MoonPay identity confirmation warning screen component */
class IdentityConfirmationWarning extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        address: PropTypes.string.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        email: PropTypes.string.isRequired,
        /** @ignore */
        isPurchaseLimitIncreaseAllowed: PropTypes.bool.isRequired,
        /** @ignore */
        hasCompletedAdvancedIdentityVerification: PropTypes.bool.isRequired,
        /** @ignore */
        dailyLimits: PropTypes.object.isRequired,
        /** @ignore */
        monthlyLimits: PropTypes.object.isRequired,
        /** @ignore */
        defaultCurrencyCode: PropTypes.string.isRequired,
        /** @ignore */
        moonpayPurchases: PropTypes.array.isRequired,
        /** @ignore */
        isFetchingMoonPayMeta: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorFetchingMoonPayMeta: PropTypes.bool.isRequired,
        /** @ignore */
        fetchMeta: PropTypes.func.isRequired,
        /** @ignore */
        setTransactionActive: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.redirect = this.redirect.bind(this);

        this.state = {
            moonpayPurchases: cloneDeep(props.moonpayPurchases),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.isFetchingMoonPayMeta &&
            !nextProps.isFetchingMoonPayMeta &&
            !nextProps.hasErrorFetchingMoonPayMeta
        ) {
            const {
                address,
                amount,
                denomination,
                dailyLimits,
                monthlyLimits,
                isPurchaseLimitIncreaseAllowed,
                hasCompletedAdvancedIdentityVerification,
                defaultCurrencyCode,
                email,
                exchangeRates,
                moonpayPurchases,
            } = nextProps;

            const purchaseAmount = convertFiatCurrency(
                getAmountInFiat(Number(amount), denomination, exchangeRates),
                exchangeRates,
                denomination,
                // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
                defaultCurrencyCode,
            );

            if (
                isPurchaseLimitIncreaseAllowed &&
                !hasCompletedAdvancedIdentityVerification &&
                (purchaseAmount > dailyLimits.dailyLimitRemaining ||
                    purchaseAmount > monthlyLimits.monthlyLimitRemaining)
            ) {
                window.open(
                    prepareMoonPayExternalLink(
                        email,
                        address,
                        getAmountInFiat(Number(amount), denomination, exchangeRates),
                        toLower(getActiveFiatCurrency(denomination)),
                    ),
                );
            } else {
                if (size(moonpayPurchases) > size(this.state.moonpayPurchases)) {
                    const oldTransactionIds = map(this.state.moonpayPurchases, (purchase) => purchase.id);
                    const newTransactionIds = map(moonpayPurchases, (purchase) => purchase.id);

                    const diff = difference(oldTransactionIds, newTransactionIds);
                    const newTransactionId = head(diff);

                    this.props.setTransactionActive(newTransactionId);
                    this.props.history.push('/exchanges/moonpay/payment-pending');
                } else {
                    this.props.history.push('/exchanges/moonpay/review-purchase');
                }
            }
        }
    }

    /**
     * Redirects to MoonPay external URL for identiy verification
     *
     * @method redirect
     *
     * @returns {void}
     */
    redirect() {
        this.props.fetchMeta();
    }

    render() {
        const { isFetchingMoonPayMeta, t } = this.props;

        return (
            <form onSubmit={this.redirect}>
                <section className={css.long}>
                    <div>
                        <p>{t('moonpay:confirmIdentity')}</p>
                        <p>{t('moonpay:moonpayRedirect')}</p>
                    </div>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            disabled={isFetchingMoonPayMeta}
                            id="to-cancel"
                            onClick={() => this.props.history.push('/exchanges/moonpay/review-purchase')}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            loading={isFetchingMoonPayMeta}
                            id="to-identity-verification"
                            type="submit"
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
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    address: getLatestAddressForMoonPaySelectedAccount(state),
    email: getCustomerEmail(state),
    isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    moonpayPurchases: getAllTransactions(state),
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    isFetchingMoonPayMeta: state.exchanges.moonpay.isFetchingMoonPayMeta,
    hasErrorFetchingMoonPayMeta: state.exchanges.moonpay.hasErrorFetchingMoonPayMeta,
});

const mapDispatchToProps = {
    fetchMeta,
    setTransactionActive,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(IdentityConfirmationWarning));
