import { MoonPayApi } from './api';

/** MoonPay supported networks */
const supportedNetworks = {
    live: 'live',
    test: 'test',
};

/** Active MoonPay network. */
const ACTIVE_NETWORK = supportedNetworks.test;

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

/** Short IOTA currency code*/
export const SHORT_IOTA_CURRENCY_CODE = 'Mi';

/**
 * The URL the customer is returned to after they authenticate or cancel their payment on the payment method’s app or site.
 *
 * See: https://www.moonpay.io/api_reference/v3#transaction_object
 */
export const MOONPAY_RETURN_URL = 'iota://moonpay-review-purchase';

/**
 * The URL provided to you, when required, to which to redirect the customer as part of a redirect authentication flow.
 *
 * See: https://www.moonpay.io/api_reference/v3#transaction_object
 */
export const MOONPAY_REDIRECT_URL = MOONPAY_RETURN_URL;

/** MoonPay test mode external link (Used for redirecting users to perform KYC) */
export const TEST_MODE_EXTERNAL_URL = 'https://buy-staging.moonpay.io';

/** MoonPay live mode external link (Used for redirecting users to perform KYC) */
export const LIVE_MODE_EXTERNAL_URL = 'https://buy.moonpay.io';

/** MoonPay external link (Used for redirecting users to perform KYC) */
export const MOONPAY_EXTERNAL_URL = `${
    ACTIVE_NETWORK === supportedNetworks.live ? LIVE_MODE_EXTERNAL_URL : TEST_MODE_EXTERNAL_URL
}?apiKey=${API_KEY}`;

/** MoonPay website URL for terms of use */
export const MOONPAY_TERMS_OF_USE_LINK = 'https://www.moonpay.io/terms_of_use';

/** MoonPay website URL for terms of use */
export const MOONPAY_PRIVACY_POLICY_LINK = 'https://www.moonpay.io/privacy_policy';

/**
 * MoonPay advanced identity (passport) verification level name
 *
 * See: https://www.moonpay.io/api_reference/v3#retrieve_customer_limits
 */
export const ADVANCED_IDENITY_VERIFICATION_LEVEL_NAME = 'Level 2';

/**
 * MoonPay basic identity (personal info) verification level name
 *
 * See: https://www.moonpay.io/api_reference/v3#retrieve_customer_limits
 */
export const BASIC_IDENITY_VERIFICATION_LEVEL_NAME = 'Level 1';

/** MoonPay minimum transaction amount (in EUR) */
export const MINIMUM_TRANSACTION_SIZE = 20;

/** MoonPay maximum transaction amount (in EUR) */
export const MAXIMUM_TRANSACTION_SIZE = 2000;

/**
 * MoonPay monthly limit once a user has signed up and has shared basic information (in EUR)
 *
 * See: https://help.moonpay.io/en/articles/2509649-what-are-the-daily-and-monthly-limits
 */
export const BASIC_MONTHLY_LIMIT = 150;

/** Allowed IOTA denominations in MoonPay implementation. */
export const ALLOWED_IOTA_DENOMINATIONS = [SHORT_IOTA_CURRENCY_CODE];

/** MoonPay fallback fiat currency. Will display purchase amount in this format if denomination is in Miota */
export const DEFAULT_FIAT_CURRENCY = 'USD';

/**
 * Alpha3 country codes for countries that require "state" input from user
 *
 * See: https://www.moonpay.io/api_reference/v3#migration_guide
 */
export const COUNTRY_CODES_REQUIRING_STATE = ['USA', 'CAN'];

/**
 * Supported transaction statuses
 *
 * See: https://www.moonpay.io/api_reference/v3#transaction_object
 */
export const MOONPAY_TRANSACTION_STATUSES = {
    pending: 'pending',
    waitingAuthorization: 'waitingAuthorization',
    failed: 'failed',
    completed: 'completed',
};

export default new MoonPayApi(API_KEY);
