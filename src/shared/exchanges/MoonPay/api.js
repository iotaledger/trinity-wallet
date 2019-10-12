import assign from 'lodash/assign';
import get from 'lodash/get';
import Errors from '../../libs/errors';
import { serialise } from '../../libs/utils';
import { __MOBILE__ } from '../../config';

export const BASE_API_URL = 'https://api.moonpay.io/v2';

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
                return __MOBILE__
                    ? {
                          Authorization: `Bearer ${this._jwt}`,
                      }
                    : {
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
            method: 'post',
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
                method: 'patch',
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
        return this._fetch(`${this.url}/currencies/${currency}/price`);
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
}
