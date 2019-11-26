import assign from 'lodash/assign';
import get from 'lodash/get';
import Errors from '../../libs/errors';
import { serialise } from '../../libs/utils';

export const API_VERSION = 'v3';

export const BASE_API_URL = `https://api.moonpay.io/${API_VERSION}`;

export class MoonPayApi {
    /**
     *
     * @param {string} apiKey
     * @param {string} [url]
     */
    constructor(apiKey, url) {
        this.apiKey = apiKey;
        this.url = url || BASE_API_URL;

        this._csrfToken = null;
        this._jwt = null;
    }

    /**
     * A basic wrapper around fetch API. Rejects promise if the status is not "ok"
     *
     * @method _fetch
     *
     * @param {string} url
     * @param {object} [options]
     * @param {boolean} [withAuthentication]
     *
     * @return {Promise}
     */
    _fetch(url, options, withAuthentication = false) {
        const _getAuthorizationHeaders = () => {
            if (withAuthentication) {
                return {
                    Authorization: `Bearer ${this._jwt}`,
                    'X-CSRF-TOKEN': this._csrfToken,
                };
            }

            return {};
        };

        const requestOptions = assign({}, options, {
            headers: {
                ..._getAuthorizationHeaders(),
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            ...(get(options, 'body')
                ? {
                      body: serialise(options.body),
                  }
                : {}),
        });

        return fetch(url, requestOptions).then((response) => {
            if (!response.ok) {
                throw new Error(Errors.REQUEST_FAILED_WITH(response.status));
            }

            return response.json();
        });
    }

    /**
     *
     * @method login
     *
     * @param {string} email
     * @param {string} securityCode
     */
    login(email, securityCode) {
        const body = {
            email,
        };

        if (securityCode) {
            body.securityCode = securityCode;
        }

        return this._fetch(`${this.url}/customers/email_login?apiKey=${this.apiKey}`, {
            method: 'POST',
            body,
        }).then((result) => {
            if (result.csrfToken && result.token) {
                this._csrfToken = result.csrfToken;

                this._jwt = result.token;
            }

            return result;
        });
    }

    /**
     * Updates user (Customer) info
     *
     * @method updateUserInfo
     *
     * @param {object} info
     *
     * @returns {Promise}
     */
    updateUserInfo(info) {
        return this._fetch(
            `${this.url}/customers/me/`,
            {
                method: 'PATCH',
                body: info,
            },
            true,
        );
    }

    /**
     * Fetches list of all countries supported by MoonPay
     *
     * @method fetchCountries
     *
     * @returns {Promise}
     */
    fetchCountries() {
        return this._fetch(`${this.url}/countries`);
    }

    /**
     * Fetches list of all currencies supported by MoonPay
     *
     * @method fetchCurrencies
     *
     * @returns {Promise}
     */
    fetchCurrencies() {
        return this._fetch(`${this.url}/currencies`);
    }

    /**
     * Fetches the exchange rate for provided currency
     *
     * @method fetchExchangeRates
     *
     * @param {string} currency
     *
     * @returns {Promise}
     */
    fetchExchangeRates(currency) {
        return this._fetch(`${this.url}/currencies/${currency}/price?apiKey=${this.apiKey}`);
    }

    /**
     * Fetches a real-time quote for provided currency
     *
     * @method fetchExchangeRates
     *
     * @param {string} currency
     * @param {number} baseCurrencyAmount
     * @param {string} baseCurrencyCode
     *
     * @returns {Promise}
     */
    fetchQuote(currency, baseCurrencyAmount, baseCurrencyCode) {
        return this._fetch(
            `${this.url}/currencies/${currency}/quote/?apiKey=${this.apiKey}&baseCurrencyAmount=${baseCurrencyAmount}&baseCurrencyCode=${baseCurrencyCode}`,
        );
    }

    /**
     * Creates a new transaction
     *
     * @method createTransaction
     *
     * @param {object} transaction
     *
     * @returns {Promise}
     */
    createTransaction(transaction) {
        return this._fetch(
            `${this.url}/transactions/`,
            {
                method: 'POST',
                body: transaction,
            },
            true,
        );
    }

    /**
     * Fetches customer transactions
     *
     * @method fetchTransactions
     *
     * @returns {Promise}
     */
    fetchTransactions() {
        return this._fetch(
            `${this.url}/transactions/`,
            {
                method: 'GET',
            },
            true,
        );
    }

    /**
     * Creates new card
     * See: https://www.moonpay.io/api_reference/v2#create_card
     *
     * @method createCard
     *
     * @param {string} tokenId
     *
     * @returns {Promise}
     */
    createPaymentCard(tokenId) {
        return this._fetch(
            `${this.url}/cards/`,
            {
                method: 'POST',
                body: {
                    tokenId,
                },
            },
            true,
        );
    }

    /**
     * Fetches user stored cards
     *
     * See: https://www.moonpay.io/api_reference/v3#list_cards
     *
     * @method fetchCards
     *
     *
     * @returns {Promise}
     */
    fetchPaymentCards() {
        return this._fetch(
            `${this.url}/cards/`,
            {
                method: 'GET',
            },
            true,
        );
    }

    /**
     * Fetches customer purchase limits
     *
     * @method fetchCustomerPurchaseLimits
     *
     * @returns {Promise}
     */
    fetchCustomerPurchaseLimits() {
        return this._fetch(
            `${this.url}/customers/me/limits`,
            {
                method: 'GET',
            },
            true,
        );
    }

    /**
     * Checks IP address of the customer
     *
     * See: https://www.moonpay.io/api_reference/v3#ip_addresses
     *
     * @method checkIPAddress
     *
     * @returns {Promise}
     */
    checkIPAddress() {
        return this._fetch(`${this.url}/ip_address?apiKey=${this.apiKey}`, {
            method: 'GET',
        });
    }

    /**
     * Refreshes logged-in customer's JWT
     *
     * See: https://www.moonpay.io/api_reference/v3#refresh_token
     *
     * @method refreshCredentials
     *
     * @param {string} jwt
     * @param {string} csrfToken
     *
     * @returns {Promise}
     */
    refreshCredentials(jwt, csrfToken) {
        this._jwt = jwt;
        this._csrfToken = csrfToken;

        return this._fetch(
            `${this.url}/customers/refresh_token?apiKey=${this.apiKey}`,
            {
                method: 'GET',
            },
            true,
        )
            .then((result) => {
                this._csrfToken = result.csrfToken;
                this._jwt = result.token;

                return result;
            })
            .catch((error) => {
                this._jwt = null;
                this._csrfToken = null;

                throw error;
            });
    }

    /**
     * Fetches meta (payment cards, exchange rates, purchase limits & transactions)
     *
     * @method fetchMeta
     *
     * @param {string} currencyCode
     *
     * @returns {Promise}
     */
    fetchMeta(currencyCode) {
        return Promise.all([
            this.fetchCustomerPurchaseLimits(),
            this.fetchPaymentCards(),
            this.fetchExchangeRates(currencyCode),
            this.fetchTransactions(),
        ]).then((meta) => {
            const [purchaseLimits, paymentCards, exchangeRates, transactions] = meta;

            return {
                purchaseLimits,
                paymentCards,
                exchangeRates,
                transactions,
            };
        });
    }

    /**
     * Fetches transaction details for provided id
     *
     * See: https://www.moonpay.io/api_reference/v3#retrieve_transaction
     *
     * @method fetchTransactionDetails
     *
     * @returns {Promise}
     */
    fetchTransactionDetails(id) {
        return this._fetch(
            `${this.url}/transactions/${id}`,
            {
                method: 'GET',
            },
            true,
        );
    }
}
