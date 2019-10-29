import { MoonPayApi } from './api';

export const API_KEY = 'pk_test_W1g4KpNvqWkHEo58O0CTluQz698eOc';

export const IOTA_CURRENCY_CODE = 'miota';

export const MOONPAY_RETURN_URL = 'iota://moonpay_success';

export const MOONPAY_EXTERNAL_LINK_BASE_URL = 'https://buy.moonpay.io';

export const ADVANCED_IDENITY_VERIFICATION_LEVEL_NAME = 'Level 2';

/** Minimum transaction amount in EUR */
export const MINIMUM_TRANSACTION_SIZE = 20;

export const MINIMUM_TRANSACTION_SIZE_DENOMINATION = 'EUR';

/** Monthly limit without KYC verification in EUR */
export const BASIC_MONTHLY_LIMIT = 150;

export const ALLOWED_IOTA_DENOMINATIONS = ['Mi'];

export const DEFAULT_FIAT_CURRENCY = 'USD';

export default new MoonPayApi(API_KEY);
