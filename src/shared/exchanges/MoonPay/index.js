import { MoonPayApi } from './api';

export const API_KEY = 'pk_live_1Ls6xJrTtp1UbdXjkD9MwBNg8sQm4aRk';

export const IOTA_CURRENCY_CODE = 'miota';

export const MOONPAY_RETURN_URL = 'iota://moonpay_success';

export default new MoonPayApi(API_KEY);
