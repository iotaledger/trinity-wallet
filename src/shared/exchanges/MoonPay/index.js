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

        this._csrfToken = '8z0GNV3pYGbr6x03qDYZNPZzWT8YK46';
        this._jwt =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiJmNDQ5OGFhOS03Mzk5LTQ0MDctYWM1Ni1mYWY1NzA3YmY0OGQiLCJjc3JmVG9rZW4iOiJSek9veGVpcWtnU3JVMm9KSnFGMnM2aEhqOXI0YkFMIiwiY3VzdG9tZXJJZCI6IjQ2MDkwMWMxLWRjNTAtNDhmMS04ZTY3LTc5MjU1NzMzZThjMyIsImlhdCI6MTU2ODc4MDcwOX0.QK-DCUt58TfvGW-hSp2K6Wr1bcH0WxdcVIhg81ZCmAA';
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
                'Content-Type': 'application/json',
                ..._getAuthorizationHeaders(),
            },
            ...(get(options, 'body')
                ? {
                      body: serialise(options.body),
                  }
                : {}),
            credentials: 'include',
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
            this._csrfToken = result.csrfToken;
            this._jwt = result.token;

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
            `${this.url}/customers/me`,
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
     * @method getCountries
     *
     * @returns {Promise}
     */
    getCountries() {
        return this._fetch(`${this.url}/countries`);
    }

    /**
     * Fetches list of all currencies supported by MoonPay
     *
     * @method getCurrencies
     *
     * @returns {Promise}
     */
    getCurrencies() {
        return this._fetch(`${this.url}/currencies`);
    }
}
