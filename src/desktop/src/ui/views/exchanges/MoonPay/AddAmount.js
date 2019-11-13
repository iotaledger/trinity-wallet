import get from 'lodash/get';
import head from 'lodash/head';
import includes from 'lodash/includes';
import map from 'lodash/map';
import toUpper from 'lodash/toUpper';
import toLower from 'lodash/toLower';
import size from 'lodash/size';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import {
    ALLOWED_IOTA_DENOMINATIONS,
    MINIMUM_TRANSACTION_SIZE,
    MAXIMUM_TRANSACTION_SIZE,
    BASIC_MONTHLY_LIMIT,
} from 'exchanges/MoonPay/index';
import { getActiveFiatCurrency, getAmountInFiat, convertFiatCurrency } from 'exchanges/MoonPay/utils';
import {
    hasCompletedBasicIdentityVerification,
    hasCompletedAdvancedIdentityVerification,
    getFiatCurrencies,
    getMoonPayFee,
    getTotalPurchaseAmount,
    isLimitIncreaseAllowed,
    getDefaultCurrencyCode,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    hasStoredAnyPaymentCards,
} from 'selectors/exchanges/MoonPay';
import { fetchQuote, setAmount, setDenomination } from 'actions/exchanges/MoonPay';
import { getCurrencySymbol } from 'libs/currency';
import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay add amount screen component */
class AddAmount extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        fiatCurrencies: PropTypes.array.isRequired,
        /** @ignore */
        isFetchingCurrencyQuote: PropTypes.bool.isRequired,
        /** @ignore */
        hasAnyPaymentCards: PropTypes.bool.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        fee: PropTypes.number.isRequired,
        /** @ignore */
        totalAmount: PropTypes.number.isRequired,
        /** @ignore */
        hasCompletedBasicIdentityVerification: PropTypes.bool.isRequired,
        /** @ignore */
        hasCompletedAdvancedIdentityVerification: PropTypes.bool.isRequired,
        /** @ignore */
        isPurchaseLimitIncreaseAllowed: PropTypes.bool.isRequired,
        /** @ignore */
        dailyLimits: PropTypes.object.isRequired,
        /** @ignore */
        monthlyLimits: PropTypes.object.isRequired,
        /** @ignore */
        defaultCurrencyCode: PropTypes.string.isRequired,
        /** @ignore */
        fetchQuote: PropTypes.func.isRequired,
        /** @ignore */
        setAmount: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setDenomination: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            /**
             * Determines if latest currency quote should be fetched.
             * We skip fetching currency quote if there is already a network in progress
             * If this flag is turned on, we would automatically fetch the latest currency quote once the previous call is finished
             * */
            shouldGetLatestCurrencyQuote: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isFetchingCurrencyQuote && !nextProps.isFetchingCurrencyQuote) {
            if (this.state.shouldGetLatestCurrencyQuote) {
                this.setState({ shouldGetLatestCurrencyQuote: false });

                const { amount, denomination, exchangeRates } = nextProps;

                this.props.fetchQuote(
                    Number(getAmountInFiat(Number(amount), denomination, exchangeRates).toFixed(2)),
                    toLower(getActiveFiatCurrency(denomination)),
                );
            }
        }
    }

    /**
     * Fetches latest currency quote
     *
     * @method fetchCurrencyQuote
     *
     * @param {string} amount
     * @param {string} denomination
     * @param {object} exchangeRates
     *
     * @returns {void}
     */
    fetchCurrencyQuote(amount, denomination, exchangeRates) {
        const { isFetchingCurrencyQuote } = this.props;

        if (
            // Check if its not already making a network call to fetch quote
            !isFetchingCurrencyQuote
        ) {
            this.props.fetchQuote(
                Number(getAmountInFiat(Number(amount), denomination, exchangeRates).toFixed(2)),
                toLower(getActiveFiatCurrency(denomination)),
            );
        } else {
            // If there is already a network call in progress, turn on shouldGetLatestCurrencyQuote flag
            // Turning this flag on will automatically make a network call as soon as the previous one is finished
            this.setState({ shouldGetLatestCurrencyQuote: true });
        }
    }

    /**
     * Sets next denomination in redux store
     *
     * @method setDenomination
     *
     * @returns {void}
     */
    setDenomination() {
        const { amount, exchangeRates, denomination, fiatCurrencies } = this.props;

        const availableDenominations = [
            ...ALLOWED_IOTA_DENOMINATIONS,
            ...map(fiatCurrencies, (currencyObject) => toUpper(get(currencyObject, 'code'))),
        ];

        const currentDenominationIndex = availableDenominations.indexOf(denomination);

        const nextDenomination =
            currentDenominationIndex === -1 || currentDenominationIndex === size(availableDenominations) - 1
                ? head(availableDenominations)
                : availableDenominations[currentDenominationIndex + 1];

        this.props.setDenomination(nextDenomination);

        this.fetchCurrencyQuote(amount, nextDenomination, exchangeRates);
    }

    /**
     * Gets receive amount
     *
     * @method getReceiveAmount
     *
     * @returns {void}
     */
    getReceiveAmount() {
        const { amount, denomination, exchangeRates } = this.props;

        if (includes(ALLOWED_IOTA_DENOMINATIONS, denomination)) {
            return amount ? `${amount} Mi` : '0 Mi';
        }

        return amount
            ? `${(Number(amount) / exchangeRates[getActiveFiatCurrency(denomination)]).toFixed(2)} Mi`
            : '0 Mi';
    }

    /**
     * Gets stringified amount in fiat
     *
     * @method getStringifiedFiatAmount
     *
     * @param {number} amount
     *
     * @returns {string}
     */
    getStringifiedFiatAmount(amount) {
        const { denomination } = this.props;
        const activeFiatCurrency = getActiveFiatCurrency(denomination);

        return amount
            ? `${getCurrencySymbol(activeFiatCurrency)}${amount.toFixed(2)}`
            : `${getCurrencySymbol(activeFiatCurrency)}0`;
    }

    /**
     * Gets warning text
     *
     * @method getWarningText
     *
     * @returns {string|object}
     */
    getWarningText() {
        const {
            amount,
            exchangeRates,
            denomination,
            defaultCurrencyCode,
            dailyLimits,
            monthlyLimits,
            hasCompletedBasicIdentityVerification,
            hasCompletedAdvancedIdentityVerification,
            isPurchaseLimitIncreaseAllowed,
            t,
        } = this.props;

        if (amount) {
            const fiatAmount = getAmountInFiat(Number(amount), denomination, exchangeRates);

            const amountInEuros = convertFiatCurrency(
                fiatAmount,
                exchangeRates,
                denomination,
                // Skipping the last parameter (target denomination) as it is already set to EUR as default parameter
            );

            if (amountInEuros < MINIMUM_TRANSACTION_SIZE) {
                return t('moonpay:minimumTransactionAmount', { amount: `€${MINIMUM_TRANSACTION_SIZE}` });
            }

            if (amountInEuros > MAXIMUM_TRANSACTION_SIZE) {
                return t('moonpay:maximumTransactionAmount', { amount: `€${MAXIMUM_TRANSACTION_SIZE}` });
            }

            if (
                !hasCompletedBasicIdentityVerification &&
                !hasCompletedAdvancedIdentityVerification &&
                isPurchaseLimitIncreaseAllowed
            ) {
                return amountInEuros > BASIC_MONTHLY_LIMIT
                    ? t('moonpay:kycRequired', { limit: `€${BASIC_MONTHLY_LIMIT}` })
                    : null;
            } else if (
                hasCompletedBasicIdentityVerification &&
                !hasCompletedAdvancedIdentityVerification &&
                isPurchaseLimitIncreaseAllowed
            ) {
                const purchaseAmount = convertFiatCurrency(
                    fiatAmount,
                    exchangeRates,
                    denomination,
                    // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
                    defaultCurrencyCode,
                );

                const _getLimit = () => {
                    let limit = null;

                    if (
                        purchaseAmount > dailyLimits.dailyLimitRemaining &&
                        purchaseAmount < monthlyLimits.monthlyLimitRemaining
                    ) {
                        limit = convertFiatCurrency(
                            dailyLimits.dailyLimitRemaining,
                            exchangeRates,
                            defaultCurrencyCode,
                            getActiveFiatCurrency(denomination),
                        );
                    } else if (
                        purchaseAmount > dailyLimits.dailyLimitRemaining &&
                        purchaseAmount > monthlyLimits.monthlyLimitRemaining
                    ) {
                        limit = convertFiatCurrency(
                            monthlyLimits.monthlyLimitRemaining,
                            exchangeRates,
                            defaultCurrencyCode,
                            getActiveFiatCurrency(denomination),
                        );
                    }

                    return limit;
                };

                const limit = _getLimit();

                // limit could be null, so add a null check
                return limit && fiatAmount > limit
                    ? t('moonpay:kycRequired', {
                          limit: `${getCurrencySymbol(getActiveFiatCurrency(denomination))}${limit.toFixed(0)}`,
                      })
                    : null;
            }
        }

        return null;
    }

    /**
     * Verifies that amount is above minimum allowed amount ($20)
     *
     * @method verifyAmount
     *
     * @returns {void}
     */
    verifyAmount() {
        const {
            amount,
            exchangeRates,
            dailyLimits,
            monthlyLimits,
            defaultCurrencyCode,
            denomination,
            t,
            hasCompletedBasicIdentityVerification,
            hasCompletedAdvancedIdentityVerification,
            isPurchaseLimitIncreaseAllowed,
            isFetchingCurrencyQuote,
            hasAnyPaymentCards,
        } = this.props;
        const { shouldGetLatestCurrencyQuote } = this.state;

        const fiatAmount = getAmountInFiat(Number(amount), denomination, exchangeRates);
        const amountInEuros = convertFiatCurrency(fiatAmount, exchangeRates, denomination);

        if (amountInEuros < MINIMUM_TRANSACTION_SIZE) {
            this.props.generateAlert(
                'error',
                t('moonpay:notEnoughAmount'),
                t('moonpay:notEnoughAmountExplanation', { amount: `€${MINIMUM_TRANSACTION_SIZE}` }),
            );
        } else if (amountInEuros > MAXIMUM_TRANSACTION_SIZE) {
            this.props.generateAlert(
                'error',
                t('moonpay:amountTooHigh'),
                t('moonpay:amountTooHighExplanation', { amount: `€${MAXIMUM_TRANSACTION_SIZE}` }),
            );
        } else {
            if (isFetchingCurrencyQuote || shouldGetLatestCurrencyQuote) {
                this.props.generateAlert('error', t('global:pleaseWait'), t('moonpay:waitForCurrencyQuote'));
            } else {
                const purchaseAmount = convertFiatCurrency(
                    fiatAmount,
                    exchangeRates,
                    denomination,
                    // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
                    defaultCurrencyCode,
                );

                this.props.history.push(
                    `/exchanges/moonpay/${
                        // Make sure user has completed basic identity verification
                        // If not, then the daily/monthly limit will default to 0
                        hasCompletedBasicIdentityVerification &&
                        !isPurchaseLimitIncreaseAllowed &&
                        hasCompletedAdvancedIdentityVerification &&
                        (purchaseAmount > dailyLimits.dailyLimitRemaining ||
                            purchaseAmount > monthlyLimits.monthlyLimitRemaining)
                            ? 'purchase-limit-warning'
                            : hasAnyPaymentCards
                            ? 'add-payment-method'
                            : 'add-payment-method'
                    }
                    `,
                );
            }
        }
    }

    render() {
        const { amount, fee, isFetchingCurrencyQuote, totalAmount, t, denomination, exchangeRates } = this.props;

        const receiveAmount = this.getReceiveAmount();
        const activeFiatCurrency = getActiveFiatCurrency(denomination);

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}>{t('moonpay:addAmount')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:addAmountExplanation')}
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={amount}
                            label={t('moonpay:enterAmount')}
                            onChange={(newAmount) => {
                                this.props.setAmount(newAmount);

                                this.fetchCurrencyQuote(newAmount, denomination, exchangeRates);
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '7px',
                        }}
                    >
                        <span>{t('moonpay:youWillReceive')}</span>
                        <span>{receiveAmount}</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '7px',
                        }}
                    >
                        <span>
                            {t('moonpay:marketPrice')}: {receiveAmount} @ {getCurrencySymbol(activeFiatCurrency)}
                            {exchangeRates[activeFiatCurrency]}
                        </span>
                        <span>
                            {this.getStringifiedFiatAmount(
                                getAmountInFiat(Number(amount), denomination, exchangeRates),
                            )}
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '30px',
                        }}
                    >
                        <span>{t('moonpay:moonpayFee')}</span>
                        <span>
                            {getCurrencySymbol(activeFiatCurrency)}
                            {fee}
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '22px',
                        }}
                    >
                        <span>{t('global:total')}</span>
                        <span>
                            {getCurrencySymbol(activeFiatCurrency)}
                            {totalAmount}
                        </span>
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
                            disabled={isFetchingCurrencyQuote}
                            id="to-transfer-funds"
                            onClick={() => this.verifyAmount()}
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
    fiatCurrencies: getFiatCurrencies(state),
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    fee: getMoonPayFee(state),
    totalAmount: getTotalPurchaseAmount(state),
    hasCompletedBasicIdentityVerification: hasCompletedBasicIdentityVerification(state),
    hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
    isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    isFetchingCurrencyQuote: state.exchanges.moonpay.isFetchingCurrencyQuote,
    hasAnyPaymentCards: hasStoredAnyPaymentCards(state),
});

const mapDispatchToProps = {
    generateAlert,
    fetchQuote,
    setAmount,
    setDenomination,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(AddAmount));
