import assign from 'lodash/assign';
import map from 'lodash/map';
import merge from 'lodash/merge';
import { mergeOmittingNull } from '../../../libs/utils';
import { MoonPayExchangeActionTypes } from '../../../types';

const initialState = {
    /**
     * Amount for purchase
     */
    amount: '',
    /**
     * Active denomination on MoonPay purchase screen
     */
    denomination: 'EUR',
    /**
     * MoonPay supported currencies
     */
    currencies: [],
    /**
     * MoonPay supported countries
     */
    countries: [],
    /**
     * MoonPay exchange rates for IOTA - { EUR, USD, GBP }
     */
    exchangeRates: {},
    /**
     * MoonPay currency quote
     */
    currencyQuote: {},
    /**
     * Selected account for transfer
     */
    accountName: '',
    /**
     * Stores customer information e.g., email, DOB
     */
    customer: {
        address: {
            country: null,
            state: null
        },
    },
    /**
     * Stores payment card info
     */
    paymentCardInfo: {},
    /**
     * Transactions history
     */
    transactions: [],
    /**
     * IP address info
     */
    ipAddress: {},
    /**
     * Determines if a network call is in progress for email authentication
     */
    isAuthenticatingEmail: false,
    /**
     * Determines if there was an error during email authentication request
     */
    hasErrorAuthenticatingEmail: false,
    /**
     * Determines if a network call is in progress for email verification
     */
    isVerifyingEmail: false,
    /**
     * Determines if there was an error during email verification request
     */
    hasErrorVerifyingEmail: false,
    /**
     * Determines if a network call is in progress for customer update
     */
    isUpdatingCustomer: false,
    /**
     * Determines if there was an error during customer update request
     */
    hasErrorUpdatingCustomer: false,
    /**
     * Determines if a network call is in progress for transaction creation
     */
    isCreatingTransaction: false,
    /**
     * Determines if there was an error during transaction creation
     */
    hasErrorCreatingTransaction: false,
    /**
     * Determines if a network call is in progress for currency quote
     */
    isFetchingCurrencyQuote: false,
    /**
     * Determines if a network call is in progress for payment card creation
     */
    isCreatingPaymentCard: false,
    /**
     * Determines if there was an error during payment card creation
     */
    hasErrorCreatingPaymentCard: false,
    /**
     * Determines if a network call is in progress for fetching transaction details
     */
    isFetchingTransactionDetails: false,
    /**
     * Determines if there was an error while fetching transaction details
     */
    hasErrorFetchingTransactionDetails: false,
    /**
     * Determines if a network call is in progress for fetching transactions
     */
    isFetchingTransactions: false,
    /**
     * Determines if the user is authenticated
     */
    isAuthenticated: false,
    /**
     * Dertermines if user is logging into Moonpay from their History
     */
    isLoggingIn: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case MoonPayExchangeActionTypes.SET_SUPPORTED_CURRENCIES:
            return {
                ...state,
                currencies: action.payload,
            };
        case MoonPayExchangeActionTypes.SET_SUPPORTED_COUNTRIES:
            return {
                ...state,
                countries: action.payload,
            };
        case MoonPayExchangeActionTypes.SET_DENOMINATION:
            return {
                ...state,
                denomination: action.payload,
            };
        case MoonPayExchangeActionTypes.SET_AMOUNT:
            return {
                ...state,
                amount: action.payload,
            };
        case MoonPayExchangeActionTypes.SET_IOTA_EXCHANGE_RATES:
            return {
                ...state,
                exchangeRates: action.payload,
            };
        case MoonPayExchangeActionTypes.SET_CURRENCY_QUOTE:
            return {
                ...state,
                currencyQuote: action.payload,
            };
        case MoonPayExchangeActionTypes.SET_ACCOUNT_NAME:
            return {
                ...state,
                accountName: action.payload,
            };
        case MoonPayExchangeActionTypes.UPDATE_CUSTOMER_INFO:
            return {
                ...state,
                customer: mergeOmittingNull(state.customer, action.payload),
            };
        case MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_REQUEST:
            return {
                ...state,
                isAuthenticatingEmail: true,
                hasErrorAuthenticatingEmail: false,
            };
        case MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_SUCCESS:
            return {
                ...state,
                isAuthenticatingEmail: false,
            };
        case MoonPayExchangeActionTypes.AUTHENTICATE_EMAIL_ERROR:
            return {
                ...state,
                isAuthenticatingEmail: false,
                hasErrorAuthenticatingEmail: true,
            };
        case MoonPayExchangeActionTypes.VERIFY_EMAIL_REQUEST:
            return {
                ...state,
                isVerifyingEmail: true,
                hasErrorVerifyingEmail: false,
            };
        case MoonPayExchangeActionTypes.VERIFY_EMAIL_SUCCESS:
            return {
                ...state,
                isVerifyingEmail: false,
            };
        case MoonPayExchangeActionTypes.VERIFY_EMAIL_ERROR:
            return {
                ...state,
                isVerifyingEmail: false,
                hasErrorVerifyingEmail: true,
            };
        case MoonPayExchangeActionTypes.UPDATE_CUSTOMER_REQUEST:
            return {
                ...state,
                isUpdatingCustomer: true,
                hasErrorUpdatingCustomer: false,
            };
        case MoonPayExchangeActionTypes.UPDATE_CUSTOMER_SUCCESS:
            return {
                ...state,
                isUpdatingCustomer: false,
            };
        case MoonPayExchangeActionTypes.UPDATE_CUSTOMER_ERROR:
            return {
                ...state,
                isUpdatingCustomer: false,
                hasErrorUpdatingCustomer: true,
            };
        case MoonPayExchangeActionTypes.ADD_PAYMENT_CARD:
            return {
                ...state,
                customer: merge({}, state.customer, {
                    paymentCards: [...state.customer.paymentCards, action.payload],
                }),
            };
        case MoonPayExchangeActionTypes.SELECT_PAYMENT_CARD:
            return {
                ...state,
                customer: merge({}, state.customer, {
                    paymentCards: map(state.customer.paymentCards, (card) =>
                        assign({}, card, { selected: card.id === action.payload }),
                    ),
                }),
            };
        case MoonPayExchangeActionTypes.CREATE_TRANSACTION_REQUEST:
            return {
                ...state,
                isCreatingTransaction: true,
                hasErrorCreatingTransaction: false,
            };
        case MoonPayExchangeActionTypes.CREATE_TRANSACTION_SUCCESS:
            return {
                ...state,
                isCreatingTransaction: false,
                transactions: [...state.transactions, action.payload],
            };
        case MoonPayExchangeActionTypes.CREATE_TRANSACTION_ERROR:
            return {
                ...state,
                isCreatingTransaction: false,
                hasErrorCreatingTransaction: true,
            };
        case MoonPayExchangeActionTypes.SET_TRANSACTIONS:
            return {
                ...state,
                transactions: action.payload,
            };
        case MoonPayExchangeActionTypes.CURRENCY_QUOTE_FETCH_REQUEST:
            return {
                ...state,
                isFetchingCurrencyQuote: true,
            };
        case MoonPayExchangeActionTypes.CURRENCY_QUOTE_FETCH_SUCCESS:
        case MoonPayExchangeActionTypes.CURRENCY_QUOTE_FETCH_ERROR:
            return {
                ...state,
                isFetchingCurrencyQuote: false,
            };
        case MoonPayExchangeActionTypes.CREATE_PAYMENT_CARD_REQUEST:
            return {
                ...state,
                isCreatingPaymentCard: true,
                hasErrorCreatingPaymentCard: false,
            };
        case MoonPayExchangeActionTypes.CREATE_PAYMENT_CARD_SUCCESS:
            return {
                ...state,
                isCreatingPaymentCard: false,
            };
        case MoonPayExchangeActionTypes.CREATE_PAYMENT_CARD_ERROR:
            return {
                ...state,
                isCreatingPaymentCard: false,
                hasErrorCreatingPaymentCard: true,
            };
        case MoonPayExchangeActionTypes.SET_IP_ADDRESS:
            return {
                ...state,
                ipAddress: action.payload,
            };
        case MoonPayExchangeActionTypes.SET_AUTHENTICATION_STATUS:
            return {
                ...state,
                isAuthenticated: action.payload,
            };
        case MoonPayExchangeActionTypes.TRANSACTION_DETAILS_FETCH_REQUEST:
            return {
                ...state,
                isFetchingTransactionDetails: true,
                hasErrorFetchingTransactionDetails: false,
            };
        case MoonPayExchangeActionTypes.TRANSACTION_DETAILS_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingTransactionDetails: false,
            };
        case MoonPayExchangeActionTypes.TRANSACTION_DETAILS_FETCH_ERROR:
            return {
                ...state,
                isFetchingTransactionDetails: false,
                hasErrorFetchingTransactionDetails: true,
            };
        case MoonPayExchangeActionTypes.UPDATE_TRANSACTION_DETAILS:
            return {
                ...state,
                transactions: map(state.transactions, (transaction) => {
                    if (transaction.id === action.payload.id) {
                        return merge({}, transaction, action.payload);
                    }

                    return transaction;
                }),
            };
        case MoonPayExchangeActionTypes.SET_LOGGING_IN:
            return {
                ...state,
                isLoggingIn: action.payload,
            };
        case MoonPayExchangeActionTypes.ADD_TRANSACTION:
            return {
                ...state,
                transactions: [...state.transactions, action.payload],
            };
        case MoonPayExchangeActionTypes.TRANSACTIONS_FETCH_REQUEST:
            return {
                ...state,
                isFetchingTransactions: true,
            };
        case MoonPayExchangeActionTypes.TRANSACTIONS_FETCH_SUCCESS:
        case MoonPayExchangeActionTypes.TRANSACTIONS_FETCH_ERROR:
            return {
                ...state,
                isFetchingTransactions: false,
            };
        case MoonPayExchangeActionTypes.CLEAR_DATA:
            return initialState;
        default:
            return state;
    }
};
