import merge from 'lodash/merge';
import { ActionTypes as SettingsActionTypes } from '../actions/settings';
import { ActionTypes as UiActionTypes } from '../actions/ui';
import { ActionTypes as TransfersActionTypes } from '../actions/transfers';
import { ActionTypes as WalletActionTypes } from '../actions/wallet';
import { ActionTypes as AccountsActionTypes } from '../actions/accounts';
import { ActionTypes as PollingActionTypes } from '../actions/polling';

const initialState = {
    /**
     * Determines if the wallet is generating receive address
     */
    isGeneratingReceiveAddress: false,
    /**
     * Determines if wallet is fetching currency information
     */
    isFetchingCurrencyData: false,
    /**
     * Determines if wallet has an error while fetching currency information
     */
    hasErrorFetchingCurrencyData: false,
    /**
     * Determines if wallet is manually promoting a transaction
     */
    isPromotingTransaction: false,
    /**
     * Determines if wallet is snapshot transitioning
     */
    isTransitioning: false,
    /**
     * Determines if wallet is attaching addresses to tangle
     */
    isAttachingToTangle: false,
    /**
     * Determines if wallet is fetching account information from tangle after a successful login
     */
    isFetchingAccountInfo: false,
    /**
     * Determines if wallet has an error fetching account information from tangle after a successful login
     */
    hasErrorFetchingFullAccountInfo: false,
    /**
     * Determines if wallet has an error fetching account information from tangle
     */
    hasErrorFetchingAccountInfo: false,
    /**
     * Determines if wallet is making a transaction
     */
    isSendingTransfer: false,
    /**
     * Determines if wallet is manually syncing
     */
    isSyncing: false,
    /**
     * Determines if application is in an inactive state
     */
    inactive: false,
    /**
     * Determines if application is in a minimised state
     */
    minimised: false,
    /**
     * Recipient address text field data
     */
    sendAddressFieldText: '',
    /**
     * Transaction amount text field data
     */
    sendAmountFieldText: '',
    /**
     * Transaction message text field data
     */
    sendMessageFieldText: '',
    /**
     * Active denomination on send screen
     */
    sendDenomination: 'i',
    /**
     * Keeps track if wallet is allowed to be minimised
     */
    doNotMinimise: false,
    /**
     * Keeps track if modal is active on any screen
     */
    isModalActive: false,
    /**
     * Modal props
     */
    modalProps: {},
    /**
     * Modal content
     */
    modalContent: 'snapshotTransitionInfo',
    /**
     * Determines if wallet is checking state/health of the newly added custom node
     */
    /**
     * Determines if wallet is checking state/health of the newly added custom node
     */
    isCheckingCustomNode: false,
    /**
     * Determines if wallet is changing selected node
     */
    isChangingNode: false,
    /**
     * Keeps track of the bundle hash currently being promoted (manually/auto)
     */
    currentlyPromotingBundleHash: '',
    /**
     * Custom route names on login screen (mobile)
     */
    loginRoute: 'login',
    /**
     * Determines if wallet is retrying a failed transaction
     */
    isRetryingFailedTransaction: false,
    /**
     * QR message data on receive screen
     */
    qrMessage: '',
    /**
     * QR amount data on receive screen
     */
    qrAmount: '',
    /**
     * QR tag data on receive screen
     */
    qrTag: '',
    /**
     * Active QR denomination on receive screen
     */
    qrDenomination: 'i',
    /**
     * Selected QR tab name on receive screen
     */
    selectedQrTab: 'message',
    /**
     * Current navigation route
     */
    currentRoute: 'login',
    /**
     * Determines whether an error occurred during address generation
     */
    hadErrorGeneratingNewAddress: false,
    /**
     * Determines whether keyboard is active
     */
    isKeyboardActive: false,
    /**
     * Determines whether to animate the chart line on mount
     */
    animateChartOnMount: true,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SettingsActionTypes.CURRENCY_DATA_FETCH_REQUEST:
            return {
                ...state,
                isFetchingCurrencyData: true,
                hasErrorFetchingCurrencyData: false,
            };
        case SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingCurrencyData: false,
            };
        case SettingsActionTypes.CURRENCY_DATA_FETCH_ERROR:
            return {
                ...state,
                isFetchingCurrencyData: false,
                hasErrorFetchingCurrencyData: true,
            };
        case UiActionTypes.SET_SEND_ADDRESS_FIELD:
            return {
                ...state,
                sendAddressFieldText: action.payload,
            };
        case UiActionTypes.SET_SEND_AMOUNT_FIELD:
            return {
                ...state,
                sendAmountFieldText: action.payload,
            };
        case UiActionTypes.SET_SEND_MESSAGE_FIELD:
            return {
                ...state,
                sendMessageFieldText: action.payload,
            };
        case UiActionTypes.CLEAR_SEND_FIELDS:
            return {
                ...state,
                sendAddressFieldText: '',
                sendAmountFieldText: '',
                sendMessageFieldText: '',
            };
        case WalletActionTypes.SET_DEEP_LINK:
            return {
                ...state,
                sendAddressFieldText: action.address,
                sendAmountFieldText: action.amount,
                sendMessageFieldText: action.message,
            };
        case UiActionTypes.SET_SEND_DENOMINATION:
            return {
                ...state,
                sendDenomination: action.payload,
            };
        case TransfersActionTypes.PROMOTE_TRANSACTION_REQUEST:
            return {
                ...state,
                isPromotingTransaction: true,
                currentlyPromotingBundleHash: action.payload,
            };
        case PollingActionTypes.PROMOTE_TRANSACTION_REQUEST:
            return {
                ...state,
                currentlyPromotingBundleHash: action.payload,
            };
        case PollingActionTypes.PROMOTE_TRANSACTION_SUCCESS:
        case PollingActionTypes.PROMOTE_TRANSACTION_ERROR:
        case TransfersActionTypes.PROMOTE_TRANSACTION_SUCCESS:
        case TransfersActionTypes.PROMOTE_TRANSACTION_ERROR:
            return {
                ...state,
                isPromotingTransaction: false,
                currentlyPromotingBundleHash: '',
            };
        case UiActionTypes.SET_USER_ACTIVITY:
            return {
                ...state,
                ...action.payload,
            };
        case WalletActionTypes.GENERATE_NEW_ADDRESS_REQUEST:
            return {
                ...state,
                isGeneratingReceiveAddress: true,
                hadErrorGeneratingNewAddress: false,
            };
        case WalletActionTypes.GENERATE_NEW_ADDRESS_ERROR:
            return {
                ...state,
                isGeneratingReceiveAddress: false,
                hadErrorGeneratingNewAddress: true,
            };
        case WalletActionTypes.GENERATE_NEW_ADDRESS_SUCCESS:
            return {
                ...state,
                isGeneratingReceiveAddress: false,
            };
        case TransfersActionTypes.SEND_TRANSFER_REQUEST:
            return {
                ...state,
                isSendingTransfer: true,
            };
        case TransfersActionTypes.SEND_TRANSFER_SUCCESS:
        case TransfersActionTypes.SEND_TRANSFER_ERROR:
            return {
                ...state,
                isSendingTransfer: false,
            };
        case WalletActionTypes.CLEAR_WALLET_DATA:
            return {
                ...state,
                isGeneratingReceiveAddress: false,
                isFetchingCurrencyData: false,
                hasErrorFetchingCurrencyData: false,
                hasErrorFetchingAccountInfo: false,
                isPromotingTransaction: false,
                isTransitioning: false,
                isAttachingToTangle: false,
                isFetchingAccountInfo: false,
                hasErrorFetchingFullAccountInfo: false,
                isSendingTransfer: false,
                isSyncing: false,
                inactive: false,
                minimised: false,
                sendAddressFieldText: '',
                sendAmountFieldText: '',
                sendMessageFieldText: '',
                sendDenomination: 'i',
                doNotMinimise: false,
                isModalActive: false,
                qrMessage: '',
                qrAmount: '',
                qrTag: '',
                qrDenomination: 'i',
                selectedQrTab: 'message',
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                isFetchingAccountInfo: true,
                hasErrorFetchingFullAccountInfo: false,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_ERROR:
            return {
                ...state,
                isFetchingAccountInfo: false,
                hasErrorFetchingFullAccountInfo: true,
            };
        case AccountsActionTypes.FULL_ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingAccountInfo: false,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                isFetchingAccountInfo: true,
                hasErrorFetchingAccountInfo: false,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingAccountInfo: false,
            };
        case AccountsActionTypes.ACCOUNT_INFO_FETCH_ERROR:
            return {
                ...state,
                isFetchingAccountInfo: false,
                hasErrorFetchingAccountInfo: true,
            };
        case AccountsActionTypes.MANUAL_SYNC_REQUEST:
            return {
                ...state,
                isSyncing: true,
            };
        case AccountsActionTypes.MANUAL_SYNC_SUCCESS:
        case AccountsActionTypes.MANUAL_SYNC_ERROR:
            return {
                ...state,
                isSyncing: false,
            };
        case WalletActionTypes.SNAPSHOT_TRANSITION_REQUEST:
            return {
                ...state,
                isTransitioning: true,
            };
        case WalletActionTypes.SNAPSHOT_TRANSITION_SUCCESS:
            return {
                ...state,
                isTransitioning: false,
            };
        case WalletActionTypes.CANCEL_SNAPSHOT_TRANSITION:
        case WalletActionTypes.SNAPSHOT_TRANSITION_ERROR:
            return {
                ...state,
                isTransitioning: false,
            };
        case WalletActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_REQUEST:
            return {
                ...state,
                isAttachingToTangle: true,
            };
        case WalletActionTypes.SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE:
            return {
                ...state,
                isAttachingToTangle: false,
            };
        case UiActionTypes.SET_DO_NOT_MINIMISE:
            return {
                ...state,
                doNotMinimise: action.payload,
            };
        case UiActionTypes.TOGGLE_MODAL_ACTIVITY:
            return {
                ...state,
                isModalActive: !state.isModalActive,
                modalProps: action.modalProps ? action.modalProps : state.modalProps,
                modalContent: action.modalContent ? action.modalContent : state.modalContent,
            };
        case UiActionTypes.UPDATE_MODAL_PROPS:
            return {
                ...state,
                modalProps: merge({}, state.modalProps, action.payload),
            };
        case SettingsActionTypes.SET_NODE_REQUEST:
            return {
                ...state,
                isChangingNode: true,
            };
        case SettingsActionTypes.ADD_CUSTOM_NODE_REQUEST:
            return {
                ...state,
                isCheckingCustomNode: true,
            };
        case SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS:
            return {
                ...state,
                isCheckingCustomNode: false,
            };
        case SettingsActionTypes.ADD_CUSTOM_NODE_ERROR:
            return {
                ...state,
                isCheckingCustomNode: false,
            };
        case SettingsActionTypes.SET_NODE:
            return {
                ...state,
                isChangingNode: false,
            };
        case SettingsActionTypes.SET_NODE_ERROR:
            return {
                ...state,
                isChangingNode: false,
            };
        case UiActionTypes.SET_LOGIN_ROUTE:
            return {
                ...state,
                loginRoute: action.payload,
            };
        case TransfersActionTypes.RETRY_FAILED_TRANSACTION_REQUEST:
            return {
                ...state,
                isRetryingFailedTransaction: true,
            };
        case TransfersActionTypes.RETRY_FAILED_TRANSACTION_SUCCESS:
        case TransfersActionTypes.RETRY_FAILED_TRANSACTION_ERROR:
            return {
                ...state,
                isRetryingFailedTransaction: false,
            };
        case UiActionTypes.SET_QR_DENOMINATION:
            return {
                ...state,
                qrDenomination: action.payload,
            };
        case UiActionTypes.SET_QR_MESSAGE:
            return {
                ...state,
                qrMessage: action.payload,
            };
        case UiActionTypes.SET_QR_AMOUNT:
            return {
                ...state,
                qrAmount: action.payload,
            };
        case UiActionTypes.SET_QR_TAG:
            return {
                ...state,
                qrTag: action.payload,
            };
        case UiActionTypes.SET_SELECTED_QR_TAB:
            return {
                ...state,
                selectedQrTab: action.payload,
            };
        case UiActionTypes.SET_ROUTE:
            return {
                ...state,
                currentRoute: action.payload,
            };
        case UiActionTypes.SET_KEYBOARD_ACTIVITY:
            return {
                ...state,
                isKeyboardActive: action.payload,
            };
        case UiActionTypes.SET_ANIMATE_CHART_ON_MOUNT:
            return {
                ...state,
                animateChartOnMount: action.payload,
            };
        default:
            return state;
    }
};
