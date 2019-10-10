import { MoonPayApi } from './api';

export const API_KEY = 'pk_test_W1g4KpNvqWkHEo58O0CTluQz698eOc';

export const IOTA_CURRENCY_CODE = 'miota';

export const MOONPAY_RETURN_URL = 'iota://moonpay_success';

export default new MoonPayApi(API_KEY);
