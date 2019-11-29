import get from 'lodash/get';
import includes from 'lodash/includes';
import map from 'lodash/map';
import toUpper from 'lodash/toUpper';
import toLower from 'lodash/toLower';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import classNames from 'classnames';

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
import Icon from 'ui/components/Icon';

import defaultTextFieldCss from 'ui/components/input/input.scss';
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
     * Gets available denominations i.e., Miota plus supported fiat currencies by MoonPay
     *
     * @method getAvailableDenominations
     *
     * @returns {array}
     */
    getAvailableDenominations() {
        const { fiatCurrencies } = this.props;

        return [
            ...ALLOWED_IOTA_DENOMINATIONS,
            ...map(fiatCurrencies, (currencyObject) => toUpper(get(currencyObject, 'code'))),
        ];
    }

    /**
     * Sets next denomination in redux store
     *
     * @method setDenomination
     *
     * @param {string}
     *
     * @returns {void}
     */
    setDenomination(nextDenomination) {
        const { amount, exchangeRates } = this.props;

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

            if (fiatAmount < MINIMUM_TRANSACTION_SIZE) {
                return t('moonpay:minimumTransactionAmount', { amount: `€${MINIMUM_TRANSACTION_SIZE}` });
            }

            if (fiatAmount > MAXIMUM_TRANSACTION_SIZE) {
                return t('moonpay:maximumTransactionAmount', { amount: `€${MAXIMUM_TRANSACTION_SIZE}` });
            }

            if (
                !hasCompletedBasicIdentityVerification &&
                !hasCompletedAdvancedIdentityVerification &&
                isPurchaseLimitIncreaseAllowed
            ) {
                return fiatAmount > BASIC_MONTHLY_LIMIT
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

        if (fiatAmount < MINIMUM_TRANSACTION_SIZE) {
            this.props.generateAlert(
                'error',
                t('moonpay:notEnoughAmount'),
                t('moonpay:notEnoughAmountExplanation', { amount: `€${MINIMUM_TRANSACTION_SIZE}` }),
            );
        } else if (fiatAmount > MAXIMUM_TRANSACTION_SIZE) {
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

                const nextRoute = `/exchanges/moonpay/${
                    // Make sure user has completed basic identity verification
                    // If not, then the daily/monthly limit will default to 0
                    hasCompletedBasicIdentityVerification &&
                    !isPurchaseLimitIncreaseAllowed &&
                    hasCompletedAdvancedIdentityVerification &&
                    (purchaseAmount > dailyLimits.dailyLimitRemaining ||
                        purchaseAmount > monthlyLimits.monthlyLimitRemaining)
                        ? 'purchase-limit-warning'
                        : hasAnyPaymentCards
                        ? 'select-payment-card'
                        : 'user-basic-info'
                }`;

                this.props.history.push(nextRoute);
            }
        }
    }

    /**
     * Renders amount text field
     *
     * @method renderTextField
     *
     * @param {string} label
     * @param {string} value
     *
     * @returns {object}
     */
    renderTextField(label, value) {
        const { denomination, exchangeRates } = this.props;

        return (
            <div className={classNames(defaultTextFieldCss.input, defaultTextFieldCss.noPadding)}>
                <fieldset>
                    <a>
                        <strong>
                            {denomination}
                            <Icon icon="chevronDown" size={8} />
                            <ul className={defaultTextFieldCss.dropdown}>
                                {this.getAvailableDenominations().map((item) => {
                                    return (
                                        <li
                                            key={item}
                                            className={item === denomination ? defaultTextFieldCss.selected : null}
                                            onClick={() => this.setDenomination(item)}
                                        >
                                            {item}
                                        </li>
                                    );
                                })}
                            </ul>
                        </strong>
                    </a>
                    <input
                        autoFocus
                        type="number"
                        value={value}
                        onChange={(e) => {
                            const newAmount = e.target.value;

                            this.props.setAmount(newAmount);
                            this.fetchCurrencyQuote(newAmount, denomination, exchangeRates);
                        }}
                    />
                    <small>{label}</small>
                </fieldset>
            </div>
        );
    }

    render() {
        const { amount, fee, isFetchingCurrencyQuote, totalAmount, t, denomination, exchangeRates } = this.props;

        const receiveAmount = this.getReceiveAmount();
        const activeFiatCurrency = getActiveFiatCurrency(denomination);

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <p>{t('moonpay:addAmount')}</p>
                        <p>{t('moonpay:addAmountExplanation')}</p>
                    </div>
                    <fieldset>{this.renderTextField(t('moonpay:enterAmount'), amount)}</fieldset>
                    <div className={css.warning}>
                        <span>{this.getWarningText()}</span>
                    </div>
                    <div className={css.summary}>
                        <div>
                            <span>{t('moonpay:youWillReceive')}</span>
                            <span>{receiveAmount}</span>
                        </div>
                        <div>
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
                        <div>
                            <span>{t('moonpay:moonpayFee')}</span>
                            <span>
                                {getCurrencySymbol(activeFiatCurrency)}
                                {fee}
                            </span>
                        </div>
                        <div>
                            <span>{t('global:total')}</span>
                            <span>
                                {getCurrencySymbol(activeFiatCurrency)}
                                {totalAmount}
                            </span>
                        </div>
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
                            id="to-select-payment-option"
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
