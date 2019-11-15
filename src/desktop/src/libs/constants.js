import { version } from '../../package.json';

/**
 * Use different account aliases for Relase Candidate versions
 */
export const __RC__ = version.toLowerCase().indexOf('rc') > 0 && process.env.NODE_ENV !== 'test' ? '-rc' : '';

/**
 * Main account encryption key alias
 */
export const ALIAS_MAIN = `Trinity${__RC__}`;

/**
 * Seed account encryption key alias
 */
export const ALIAS_ACCOUNT = `account${__RC__}`;

/**
 * Realm database encryption key alias
 */
export const ALIAS_REALM = `realm_enc_key${__RC__}`;

/**
 * MoonPay credentials key alias
 */
export const ALIAS_MOONPAY_CREDENTIALS = `moonpay_credentials${__RC__}`;
