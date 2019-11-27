import assign from 'lodash/assign';
import map from 'lodash/map';
import merge from 'lodash/merge';
import get from 'lodash/get';
import find from 'lodash/find';
import toUpper from 'lodash/toUpper';
import some from 'lodash/some';
import { MoonPayExchangeActionTypes } from '../../../types';
import { generateAlert } from '../../alerts';
import api, { IOTA_CURRENCY_CODE, MOONPAY_RETURN_URL } from '../../../exchanges/MoonPay';
import { getCustomerEmail, getSelectedPaymentCard, getCustomerCountryCode } from '../../../selectors/exchanges/MoonPay';
import { __DEV__ } from '../../../config';
import i18next from '../../../libs/i18next';

/**
 * Dispatch to set supported currencies by MoonPay
 *
 * @method setSupportedCurrencies
 *
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const setSupportedCurrencies = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_SUPPORTED_CURRENCIES,
    payload,
});

/**
 * Dispatch to set supported currencies by MoonPay
 *
 * @method setSupportedCountries
 *
 * @param {array} payload
 *
 * @returns {{type: {string}, payload: {array} }}
 */
export const setSupportedCountries = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_SUPPORTED_COUNTRIES,
    payload,
});

/**
 * Dispatch to set Iota exchange rates
 *
 * @method setIotaExchangeRates
 *
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setIotaExchangeRates = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_IOTA_EXCHANGE_RATES,
    payload,
});

/**
 * Dispatch to set active denomination on AddAmount MoonPay screen
 *
 * @method setDenomination
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setDenomination = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_DENOMINATION,
    payload,
});

/**
 * Dispatch to set purchase amount
 *
 * @method setAmount
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setAmount = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_AMOUNT,
    payload,
});

/**
 * Dispatch to set currency quote
 *
 * @method setCurrencyQuote
 *
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setCurrencyQuote = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_CURRENCY_QUOTE,
    payload,
});

/**
 * Dispatch to set account name
 *
 * @method setAccountName
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setAccountName = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_ACCOUNT_NAME,
    payload,
});

/**
 * Dispatch to update customer info
 *
 * @method updateCustomerInfo
 *
 * @param {object} payload
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateCustomerInfo = (payload) => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_INFO,
    payload,
});

/**
 * Dispatch when request for email authentication is about to be made
 *
 * @method fullAccountInfoFetchRequest
 *
 * @returns {{type: {string} }}
 */
export const authenticateEmailRequest = () => ({
    type: MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_REQUEST,
});

/**
 * Dispatch when request for email authentication is successfully made
 *
 * @method authenticateEmailSuccess
 *
 * @returns {{type: {string} }}
 */
export const authenticateEmailSuccess = () => ({
    type: MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_SUCCESS,
});

/**
 * Dispatch when request for email authentication is not successful
 *
 * @method authenticateEmailError
 *
 * @returns {{type: {string} }}
 */
export const authenticateEmailError = () => ({
    type: MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_ERROR,
});

/**
 * Dispatch when request for email verification is about to be made
 *
 * @method verifyEmailRequest
 *
 * @returns {{type: {string} }}
 */
export const verifyEmailRequest = () => ({
    type: MoonPayExchangeActionTypes.VERIFY_EMAIL_REQUEST,
});

/**
 * Dispatch when request for email verification is successfully made
 *
 * @method verifyEmailSuccess
 *
 * @returns {{type: {string} }}
 */
export const verifyEmailSuccess = () => ({
    type: MoonPayExchangeActionTypes.VERIFY_EMAIL_SUCCESS,
});

/**
 * Dispatch when request for email verification is not successful
 *
 * @method verifyEmailError
 *
 * @returns {{type: {string} }}
 */
export const verifyEmailError = () => ({
    type: MoonPayExchangeActionTypes.VERIFY_EMAIL_ERROR,
});

/**
 * Dispatch when request for customer update is about to be made
 *
 * @method updateCustomerRequest
 *
 * @returns {{type: {string} }}
 */
export const updateCustomerRequest = () => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_REQUEST,
});

/**
 * Dispatch when request for customer update is successfully made
 *
 * @method updateCustomerSuccess
 *
 * @returns {{type: {string} }}
 */
export const updateCustomerSuccess = () => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_SUCCESS,
});

/**
 * Dispatch when request for customer update is not successful
 *
 * @method updateCustomerError
 *
 * @returns {{type: {string} }}
 */
export const updateCustomerError = () => ({
    type: MoonPayExchangeActionTypes.UPDATE_CUSTOMER_ERROR,
});

/**
 * Dispatch to add payment card info
 *
 * @method addPaymentCard
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const addPaymentCard = (payload) => ({
    type: MoonPayExchangeActionTypes.ADD_PAYMENT_CARD,
    payload,
});

/**
 * Dispatch to select payment card
 *
 * @method selectPaymentCard
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const selectPaymentCard = (payload) => ({
    type: MoonPayExchangeActionTypes.SELECT_PAYMENT_CARD,
    payload,
});

/**
 * Dispatch when request for createe transaction is about to be made
 *
 * @method createTransactionRequest
 *
 * @returns {{type: {string} }}
 */
export const createTransactionRequest = () => ({
    type: MoonPayExchangeActionTypes.CREATE_TRANSACTION_REQUEST,
});

/**
 * Dispatch when request for create transaction is successfully made
 *
 * @method createTransactionSuccess
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const createTransactionSuccess = (payload) => ({
    type: MoonPayExchangeActionTypes.CREATE_TRANSACTION_SUCCESS,
    payload,
});

/**
 * Dispatch when request for create transaction is not successful
 *
 * @method createTransactionError
 *
 * @returns {{type: {string} }}
 */
export const createTransactionError = () => ({
    type: MoonPayExchangeActionTypes.CREATE_TRANSACTION_ERROR,
});

/**
 * Dispatch to set customer transactions in state
 *
 * @method createTransactionError
 *
 * @returns {{type: {string}, payload: {{object}} }}
 */
export const setTransactions = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_TRANSACTIONS,
    payload,
});

/**
 * Dispatch when request for currency quote is about to be made
 *
 * @method fetchCurrencyQuoteRequest
 *
 * @returns {{type: {string} }}
 */
export const fetchCurrencyQuoteRequest = () => ({
    type: MoonPayExchangeActionTypes.CURRENCY_QUOTE_FETCH_REQUEST,
});

/**
 * Dispatch when request for currency quote is successfully made
 *
 * @method fetchCurrencyQuoteSuccess
 *
 * @returns {{type: {string} }}
 */
export const fetchCurrencyQuoteSuccess = () => ({
    type: MoonPayExchangeActionTypes.CURRENCY_QUOTE_FETCH_SUCCESS,
});

/**
 * Dispatch when request for currency quote is not successful
 *
 * @method fetchCurrencyQuoteError
 *
 * @returns {{type: {string} }}
 */
export const fetchCurrencyQuoteError = () => ({
    type: MoonPayExchangeActionTypes.CURRENCY_QUOTE_FETCH_ERROR,
});

/**
 * Dispatch when request for create payment card is about to be made
 *
 * @method createPaymentCardRequest
 *
 * @returns {{type: {string} }}
 */
export const createPaymentCardRequest = () => ({
    type: MoonPayExchangeActionTypes.CREATE_PAYMENT_CARD_REQUEST,
});

/**
 * Dispatch when request for create payment card is successfully made
 *
 * @method createPaymentCardSuccess
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const createPaymentCardSuccess = (payload) => ({
    type: MoonPayExchangeActionTypes.CREATE_PAYMENT_CARD_SUCCESS,
    payload,
});

/**
 * Dispatch when request for create payment card is not successful
 *
 * @method createPaymentCardError
 *
 * @returns {{type: {string} }}
 */
export const createPaymentCardError = () => ({
    type: MoonPayExchangeActionTypes.CREATE_PAYMENT_CARD_ERROR,
});

/**
 * Dispatch to set IP address info in state
 *
 * @method setIPAddress
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const setIPAddress = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_IP_ADDRESS,
    payload,
});

/**
 * Dispatch to set user's authentication status
 *
 * @method setIPAddress
 *
 * @returns {{type: {string}, payload: {boolean} }}
 */
export const setAuthenticationStatus = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_AUTHENTICATION_STATUS,
    payload,
});

/**
 * Dispatch when request for fetching transaction details is about to be made
 *
 * @method fetchTransactionDetailsRequest
 *
 * @returns {{type: {string} }}
 */
export const fetchTransactionDetailsRequest = () => ({
    type: MoonPayExchangeActionTypes.TRANSACTION_DETAILS_FETCH_REQUEST,
});

/**
 * Dispatch when request for fetching transaction details is successfully made
 *
 * @method fetchTransactionDetailsSuccess
 *
 * @returns {{type: {string} }}
 */
export const fetchTransactionDetailsSuccess = () => ({
    type: MoonPayExchangeActionTypes.TRANSACTION_DETAILS_FETCH_SUCCESS,
});

/**
 * Dispatch when request for fetching transaction details is not successful
 *
 * @method fetchTransactionDetailsError
 *
 * @returns {{type: {string} }}
 */
export const fetchTransactionDetailsError = () => ({
    type: MoonPayExchangeActionTypes.TRANSACTION_DETAILS_FETCH_ERROR,
});

/**
 * Dispatch to update transaction details
 *
 * @method updateTransactionDetails
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const updateTransactionDetails = (payload) => ({
    type: MoonPayExchangeActionTypes.UPDATE_TRANSACTION_DETAILS,
    payload,
});

/**
 * Dispatch to add new transaction
 *
 * @method addTransaction
 *
 * @returns {{type: {string}, payload: {object} }}
 */
export const addTransaction = (payload) => ({
    type: MoonPayExchangeActionTypes.ADD_TRANSACTION,
    payload,
});

/**
 * Dispatch when request for fetching transactions is about to be made
 *
 * @method fetchTransactionsRequest
 *
 * @returns {{type: {string} }}
 */
export const fetchTransactionsRequest = () => ({
    type: MoonPayExchangeActionTypes.TRANSACTIONS_FETCH_REQUEST,
});

/**
 * Dispatch when request for fetching transactions is successfully made
 *
 * @method fetchTransactionsSuccess
 *
 * @returns {{type: {string} }}
 */
export const fetchTransactionsSuccess = () => ({
    type: MoonPayExchangeActionTypes.TRANSACTIONS_FETCH_SUCCESS,
});

/**
 * Dispatch when request for fetching transactions is not successful
 *
 * @method fetchTransactionsError
 *
 * @returns {{type: {string} }}
 */
export const fetchTransactionsError = () => ({
    type: MoonPayExchangeActionTypes.TRANSACTIONS_FETCH_ERROR,
});

/**
 * Dispatch to set logging in status
 *
 * @method setLoggingIn
 *
 * @param {string} payload
 *
 * @returns {{type: {string}, payload: {string} }}
 */
export const setLoggingIn = (payload) => ({
    type: MoonPayExchangeActionTypes.SET_LOGGING_IN,
    payload,
});

/**
 * Fetches list of all currencies supported by MoonPay
 *
 * @method fetchCurrencies
 *
 * @returns {function}
 */
export const fetchCurrencies = () => (dispatch) => {
    api.fetchCurrencies()
        .then((currencies) => dispatch(setSupportedCurrencies(currencies)))
        .catch((error) => {
            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Fetches list of all countries supported by MoonPay
 *
 * @method fetchCountries
 *
 * @returns {function}
 */
export const fetchCountries = () => (dispatch) => {
    api.fetchCountries()
        .then((countries) => dispatch(setSupportedCountries(countries)))
        .catch((error) => {
            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Fetches real-time currency quote
 *
 * @method fetchQuote
 *
 * @param {number} baseCurrencyAmount
 * @param {string} baseCurrencyCode
 *
 * @returns {function}
 */
export const fetchQuote = (baseCurrencyAmount, baseCurrencyCode) => (dispatch) => {
    dispatch(fetchCurrencyQuoteRequest());

    api.fetchQuote(IOTA_CURRENCY_CODE, baseCurrencyAmount, baseCurrencyCode)
        .then((quote) => {
            dispatch(setCurrencyQuote(quote));
            dispatch(fetchCurrencyQuoteSuccess());
        })
        .catch((error) => {
            dispatch(setCurrencyQuote({}));
            dispatch(fetchCurrencyQuoteError());

            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Authenticates customer via email
 *
 * @method authenticateViaEmail
 *
 * @param {string} email
 *
 * @returns {function}
 */
export const authenticateViaEmail = (email) => (dispatch) => {
    dispatch(authenticateEmailRequest());

    api.login(email)
        .then(() => {
            dispatch(updateCustomerInfo({ email }));
            dispatch(authenticateEmailSuccess());
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    i18next.t('moonpay:authenticateEmailError'),
                    i18next.t('moonpay:authenticateEmailErrorExplanation'),
                ),
            );

            dispatch(authenticateEmailError());
        });
};

/**
 * Verifies customer's email and fetch meta (transactions, purchase limits, exchange rates)
 *
 * @method verifyEmailAndFetchMeta
 *
 * @param {string} securityCode
 *
 * @returns {function}
 */
export const verifyEmailAndFetchMeta = (securityCode, keychainAdapter) => (dispatch, getState) => {
    dispatch(verifyEmailRequest());

    api.login(getCustomerEmail(getState()), securityCode)
        .then((data) => {
            return keychainAdapter
                .set({ jwt: get(data, 'token'), csrfToken: get(data, 'csrfToken') })
                .then(() => api.fetchMeta(IOTA_CURRENCY_CODE))
                .then((meta) => {
                    dispatch(setAuthenticationStatus(true));
                    dispatch(
                        setMeta(
                            assign({}, meta, {
                                customer: data.customer,
                            }),
                        ),
                    );

                    dispatch(verifyEmailSuccess());
                });
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    i18next.t('moonpay:emailVerificationError'),
                    i18next.t('moonpay:emailVerificationErrorExplanation'),
                ),
            );

            dispatch(verifyEmailError());
        });
};

/**
 * Updates customer's information
 *
 * @method updateCustomer
 *
 * @param {object} info
 *
 * @returns {function}
 */
export const updateCustomer = (info) => (dispatch, getState) => {
    dispatch(updateCustomerRequest());

    api.updateUserInfo(info)
        .then((data) => {
            return api.fetchCustomerPurchaseLimits().then((purchaseLimits) => {
                dispatch(
                    updateCustomerInfo(
                        merge({}, data, {
                            address: {
                                country: get(info, 'address.country')
                                    ? get(data, 'address.country')
                                    : getCustomerCountryCode(getState()),
                            },
                            purchaseLimits,
                        }),
                    ),
                );
                dispatch(updateCustomerSuccess());
            });
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    i18next.t('moonpay:updateCustomerError'),
                    i18next.t('moonpay:updateCustomerErrorExplanation'),
                ),
            );

            dispatch(updateCustomerError());
        });
};

/**
 * Creates new transaction
 *
 * @method createTransaction
 *
 * @param {number} baseCurrencyAmount
 *
 * @returns {function}
 */
export const createTransaction = (
    baseCurrencyAmount,
    baseCurrencyCode,
    walletAddress,
    extraFeePercentage = 0,
    returnUrl = MOONPAY_RETURN_URL,
) => (dispatch, getState) => {
    dispatch(createTransactionRequest());

    api.createTransaction({
        baseCurrencyAmount,
        baseCurrencyCode,
        walletAddress,
        extraFeePercentage,
        returnUrl,
        cardId: get(getSelectedPaymentCard(getState()), 'id'),
        currencyCode: IOTA_CURRENCY_CODE,
    })
        .then((data) => {
            const { currencies } = getState().exchanges.moonpay;

            dispatch(
                createTransactionSuccess(
                    assign({}, data, {
                        active: true,
                        currencyCode: toUpper(
                            get(
                                find(currencies, (currency) => currency.id === data.baseCurrencyId),
                                'code',
                            ),
                        ),
                    }),
                ),
            );
        })
        .catch(() => {
            dispatch(
                generateAlert(
                    'error',
                    i18next.t('moonpay:transactionCreationError'),
                    i18next.t('moonpay:transactionCreationErrorExplanation'),
                ),
            );

            dispatch(createTransactionError());
        });
};

/**
 * Creates a new card
 * See: https://www.moonpay.io/api_reference/v2#create_card
 *
 * @method createCard
 *
 * @param {tokenId} tokenId
 *
 * @returns {function}
 */
export const createPaymentCard = (tokenId) => (dispatch) => {
    dispatch(createPaymentCardRequest());

    api.createPaymentCard(tokenId)
        .then((paymentCard) => {
            dispatch(addPaymentCard(paymentCard));
            dispatch(selectPaymentCard(get(paymentCard, 'id')));
            dispatch(createPaymentCardSuccess());
        })
        .catch(() => {
            dispatch(createPaymentCardError());
        });
};

/**
 * Checks IP address
 *
 * See: https://www.moonpay.io/api_reference/v3#ip_addresses
 *
 * @method checkIPAddress
 *
 * @returns {function}
 */
export const checkIPAddress = () => (dispatch) => {
    api.checkIPAddress()
        .then((info) => {
            dispatch(setIPAddress(info));
        })
        .catch((error) => {
            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Sets customer meta information (payment cards, exchange rates, purchase limits & transactions) in state
 *
 * @method setMeta
 *
 * @param {object} meta
 *
 * @returns {function}
 */
export const setMeta = (meta) => (dispatch, getState) => {
    const { currencies } = getState().exchanges.moonpay;
    const { customer, purchaseLimits, paymentCards, exchangeRates, transactions } = meta;

    const { defaultCurrencyId } = customer;

    dispatch(
        updateCustomerInfo(
            merge({}, customer, {
                defaultCurrencyCode: toUpper(
                    get(
                        find(currencies, (currency) => currency.id === defaultCurrencyId),
                        'code',
                    ),
                ),
                address: {
                    // If a user is new, he/she will have to choose country from the landing screen
                    // But the selected country is only stored locally until the point we allow user to update his/her information
                    // Therefore, first try to keep the locally stored country. If it's not set, default to the one returned by MoonPay servers.
                    country: getCustomerCountryCode(getState()) || get(customer, 'address.country'),
                },
                purchaseLimits,
                paymentCards: map(paymentCards, (card) => assign({}, card, { selected: false })),
            }),
        ),
    );

    dispatch(setIotaExchangeRates(exchangeRates));

    dispatch(
        setTransactions(
            map(transactions, (transaction) =>
                assign(
                    {},
                    transaction,
                    // "active" property determines if the transaction is active on user screen
                    // i.e., the acive transaction user made from Trinity after authenticating himself/herself
                    // Also, see #createTransaction action where we set the new transaction to "active"
                    {
                        active: false,
                        currencyCode: toUpper(
                            get(
                                find(currencies, (currency) => currency.id === transaction.baseCurrencyId),
                                'code',
                            ),
                        ),
                    },
                ),
            ),
        ),
    );
};

/**
 * Refreshes logged-in customer's JWT and fetches customer info
 *
 * See: https://www.moonpay.io/api_reference/v3#refresh_token
 *
 * @method refreshCredentialsAndFetchMeta
 *
 * @param {string} jwt
 * @param {string} csrfToken
 * @param {object} keychainAdapter
 *
 * @returns {function}
 */
export const refreshCredentialsAndFetchMeta = (jwt, csrfToken, keychainAdapter) => (dispatch) => {
    api.refreshCredentials(jwt, csrfToken)
        .then((data) => {
            return keychainAdapter
                .set({ jwt: get(data, 'token'), csrfToken: get(data, 'csrfToken') })
                .then(() => api.fetchMeta(IOTA_CURRENCY_CODE))
                .then((meta) => {
                    dispatch(setAuthenticationStatus(true));
                    dispatch(
                        setMeta(
                            assign({}, meta, {
                                customer: data.customer,
                            }),
                        ),
                    );
                });
        })
        .catch((error) => {
            dispatch(setAuthenticationStatus(false));

            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Fetches transaction details
 *
 * See: https://www.moonpay.io/api_reference/v3#retrieve_transaction
 *
 * @method fetchTransactionDetails
 *
 * @param {string} id
 *
 * @returns {function}
 */
export const fetchTransactionDetails = (id) => (dispatch, getState) => {
    dispatch(fetchTransactionDetailsRequest());

    api.fetchTransactionDetails(id)
        .then((transaction) => {
            const { currencies, transactions } = getState().exchanges.moonpay;

            const updatedTransaction = assign({}, transaction, {
                // Make transaction active
                active: true,
                currencyCode: toUpper(
                    get(
                        find(currencies, (currency) => currency.id === transaction.baseCurrencyId),
                        'code',
                    ),
                ),
            });

            if (some(transactions, (transaction) => transaction.id === id)) {
                dispatch(updateTransactionDetails(updatedTransaction));
            } else {
                dispatch(addTransaction(updatedTransaction));
            }

            dispatch(fetchTransactionDetailsSuccess());
        })
        .catch((error) => {
            dispatch(fetchTransactionDetailsError());

            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};

/**
 * Fetch transaction history from Moonpay servers
 *
 * @method fetchTransactions
 *
 * @returns {function}
 */
export const fetchTransactions = () => (dispatch, getState) => {
    dispatch(fetchTransactionsRequest());

    api.fetchTransactions()
        .then((transactions) => {
            const { currencies } = getState().exchanges.moonpay;
            dispatch(fetchTransactionsSuccess());

            dispatch(
                setTransactions(
                    map(transactions, (transaction) =>
                        assign(
                            {},
                            transaction,
                            // "active" property determines if the transaction is active on user screen
                            // i.e., the acive transaction user made from Trinity after authenticating himself/herself
                            // Also, see #createTransaction action where we set the new transaction to "active"
                            {
                                active: false,
                                currencyCode: toUpper(
                                    get(
                                        find(currencies, (currency) => currency.id === transaction.baseCurrencyId),
                                        'code',
                                    ),
                                ),
                            },
                        ),
                    ),
                ),
            );
        })
        .catch((error) => {
            dispatch(fetchTransactionsError());

            if (__DEV__) {
                /* eslint-disable no-console */
                console.log(error);
                /* eslint-enable no-console */
            }
        });
};
