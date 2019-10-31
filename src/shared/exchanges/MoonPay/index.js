import { MoonPayApi } from './api';

/** MoonPay supported networks */
const supportedNetworks = {
    live: 'live',
    test: 'test',
};

/** Active MoonPay network. */
const ACTIVE_NETWORK = supportedNetworks.live;

/**
 * MoonPay test mode API key
 *
 * Note: Requests made with test mode credentials never hit the banking networks and incur no cost.
 */
const TEST_MODE_API_KEY = 'pk_test_W1g4KpNvqWkHEo58O0CTluQz698eOc';

/**
 * MoonPay test mode API key
 *
 * Note: Requests made with live mode credentials WILL hit the banking networks.
 */
const LIVE_MODE_API_KEY = 'pk_live_1Ls6xJrTtp1UbdXjkD9MwBNg8sQm4aRk';

/**
 * Active MoonPay API key
 *
 * Note: This API key does not carry privileges, it's safe to use it on client-side code.
 *
 * See: https://www.moonpay.io/api_reference/v3#authentication
 */
export const API_KEY = ACTIVE_NETWORK === supportedNetworks.live ? LIVE_MODE_API_KEY : TEST_MODE_API_KEY;

/** MoonPay currency code for IOTA */
export const IOTA_CURRENCY_CODE = 'miota';

/**
 * The URL the customer is returned to after they authenticate or cancel their payment on the payment method’s app or site.
 *
 * See: https://www.moonpay.io/api_reference/v3#transaction_object
 */
export const MOONPAY_RETURN_URL = 'iota://';

/**
 * The URL provided to you, when required, to which to redirect the customer as part of a redirect authentication flow.
 *
 * See: https://www.moonpay.io/api_reference/v3#transaction_object
 */
export const MOONPAY_REDIRECT_URL = MOONPAY_RETURN_URL;

/** MoonPay external link (Used for redirecting users to perform KYC) */
export const MOONPAY_EXTERNAL_URL = `https://buy-staging.moonpay.io?apiKey=${API_KEY}`;

/** MoonPay website URL for terms of use */
export const MOONPAY_TERMS_OF_USE_LINK = 'https://www.moonpay.io/terms_of_use';

/**
 * MoonPay advanced identity (passport) verification level name
 *
 * See: https://www.moonpay.io/api_reference/v3#retrieve_customer_limits
 */
export const ADVANCED_IDENITY_VERIFICATION_LEVEL_NAME = 'Level 2';

/** MoonPay minimum transaction amount in EUR */
export const MINIMUM_TRANSACTION_SIZE = 20;

/** Allowed IOTA denominations in MoonPay implementation. */
export const ALLOWED_IOTA_DENOMINATIONS = ['Mi'];

/** MoonPay fallback fiat currency. Will display purchase amount in this format if denomination is in Miota */
export const DEFAULT_FIAT_CURRENCY = 'USD';

export default new MoonPayApi(API_KEY);
