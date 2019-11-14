import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import {
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    getMostRecentTransaction,
    getDefaultCurrencyCode,
} from 'selectors/exchanges/MoonPay';
import { getAmountInFiat, convertFiatCurrency } from 'exchanges/MoonPay/utils';
import { moment } from 'libs/exports';

import Button from 'ui/components/Button';

import css from './index.scss';

/** MoonPay purchase limit warning screen component */
class PurchaseLimitWarning extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        dailyLimits: PropTypes.object.isRequired,
        /** @ignore */
        monthlyLimits: PropTypes.object.isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        defaultCurrencyCode: PropTypes.string.isRequired,
        /** @ignore */
        mostRecentTransaction: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const {
            t,
            amount,
            denomination,
            exchangeRates,
            defaultCurrencyCode,
            dailyLimits,
            monthlyLimits,
            mostRecentTransaction,
        } = this.props;

        const purchaseAmount = convertFiatCurrency(
            getAmountInFiat(Number(amount), denomination, exchangeRates),
            exchangeRates,
            denomination,
            // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
            defaultCurrencyCode,
        );

        const { createdAt } = mostRecentTransaction;
        const oneDayFromCreatedAt = moment(createdAt).add(1, 'days');
        const oneMonthFromCreatedAt = moment(createdAt).add(1, 'months');
        const exceedsDaily =
            purchaseAmount > dailyLimits.dailyLimitRemaining && purchaseAmount < monthlyLimits.monthlyLimitRemaining;

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <p> {t('moonpay:limitExceeded')}</p>
                        <p>
                            {t('moonpay:limitExceededExplanation', {
                                amount: exceedsDaily ? '€2000' : '€10000',
                                limitBracket: exceedsDaily ? 'day' : 'month',
                            })}
                        </p>
                        <p>
                            {t('moonpay:limitResetExplanation', {
                                time: exceedsDaily
                                    ? oneDayFromCreatedAt.format('hh:mm')
                                    : oneMonthFromCreatedAt.format('hh:mm'),
                                date: exceedsDaily
                                    ? oneDayFromCreatedAt.format('Do MMM YYYY')
                                    : oneMonthFromCreatedAt.format('Do MMM YYYY'),
                            })}
                        </p>
                    </div>
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
                            id="to-wallet-dashboard"
                            onClick={() => this.props.history.push('/wallet')}
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
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    mostRecentTransaction: getMostRecentTransaction(state),
});

export default connect(mapStateToProps)(withTranslation()(PurchaseLimitWarning));
