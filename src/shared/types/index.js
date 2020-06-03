/** Accounts action types */
export const AccountsActionTypes = {
    UPDATE_ACCOUNT_INFO_AFTER_SPENDING: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_INFO_AFTER_SPENDING',
    UPDATE_ACCOUNT_AFTER_REATTACHMENT: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_REATTACHMENT',
    UPDATE_ADDRESS_DATA: 'IOTA/ACCOUNTS/UPDATE_ADDRESS_DATA',
    CHANGE_ACCOUNT_NAME: 'IOTA/ACCOUNTS/CHANGE_ACCOUNT_NAME',
    REMOVE_ACCOUNT: 'IOTA/ACCOUNTS/REMOVE_ACCOUNT',
    SET_ONBOARDING_COMPLETE: 'IOTA/ACCOUNTS/SET_ONBOARDING_COMPLETE',
    UPDATE_ACCOUNT_AFTER_TRANSITION: 'IOTA/ACCOUNTS/UPDATE_ACCOUNT_AFTER_TRANSITION',
    FULL_ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST',
    FULL_ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_SUCCESS',
    FULL_ACCOUNT_INFO_FETCH_ERROR: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_ERROR',
    MANUAL_SYNC_REQUEST: 'IOTA/ACCOUNTS/MANUAL_SYNC_REQUEST',
    MANUAL_SYNC_SUCCESS: 'IOTA/ACCOUNTS/MANUAL_SYNC_SUCCESS',
    MANUAL_SYNC_ERROR: 'IOTA/ACCOUNTS/MANUAL_SYNC_ERROR',
    ACCOUNT_INFO_FETCH_REQUEST: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_REQUEST',
    ACCOUNT_INFO_FETCH_SUCCESS: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
    ACCOUNT_INFO_FETCH_ERROR: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR',
    SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION: 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_MANUAL_PROMOTION',
    SET_BASIC_ACCOUNT_INFO: 'IOTA/ACCOUNTS/SET_BASIC_ACCOUNT_INFO',
    SET_ACCOUNT_INFO_DURING_SETUP: 'IOTA/ACCOUNTS/SET_ACCOUNT_INFO_DURING_SETUP',
    MARK_TASK_AS_DONE: 'IOTA/ACCOUNTS/MARK_TASK_AS_DONE',
    SYNC_ACCOUNT_BEFORE_SWEEPING: 'IOTA/ACCOUNTS/SYNC_ACCOUNT_BEFORE_SWEEPING',
    OVERRIDE_ACCOUNT_INFO: 'IOTA/ACCOUNTS/OVERRIDE_ACCOUNT_INFO',
    ASSIGN_ACCOUNT_INDEX: 'IOTA/ACCOUNTS/ASSIGN_ACCOUNT_INDEX',
};

/** Alerts action types */
export const AlertsActionTypes = {
    SHOW: 'IOTA/ALERTS/SHOW',
    HIDE: 'IOTA/ALERTS/HIDE',
    UPDATE_LOG: 'IOTA/ALERTS/UPDATE_LOG',
    CLEAR_LOG: 'IOTA/ALERTS/CLEAR_LOG',
};

/** Home screen (mobile) action types */
export const HomeActionTypes = {
    CHANGE_HOME_SCREEN_CHILD_ROUTE: 'IOTA/HOME/ROUTE/CHANGE',
    TOGGLE_TOP_BAR_DISPLAY: 'IOTA/HOME/TOP_BAR/TOGGLE',
};

/** Keychain (mobile) action types */
export const KeychainActionTypes = {
    IS_GETTING_SENSITIVE_INFO_REQUEST: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_REQUEST',
    IS_GETTING_SENSITIVE_INFO_SUCCESS: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_SUCCESS',
    IS_GETTING_SENSITIVE_INFO_ERROR: 'IOTA/KEYCHAIN/IS_GETTING_SENSITIVE_INFO_ERROR',
};

/** Market data action types */
export const MarketDataActionTypes = {
    SET_TIMEFRAME: 'IOTA/MARKET_DATA/SET_TIMEFRAME',
    SET_CHART_DATA: 'IOTA/MARKET_DATA/SET_CHART_DATA',
    SET_RATES_DATA: 'IOTA/MARKET_DATA/SET_RATES_DATA',
    SET_STATISTICS: 'IOTA/MARKET_DATA/SET_STATISTICS',
    SET_PRICE: 'IOTA/MARKET_DATA/SET_PRICE',
};

/**
 * Migrations action types
 */
export const MigrationsActionTypes = {
    SET_REALM_MIGRATION_STATUS: 'IOTA/SETTINGS/SET_REALM_MIGRATION_STATUS',
};

/** Polling action types */
export const PollingActionTypes = {
    SET_POLL_FOR: 'IOTA/POLLING/SET_POLL_FOR',
    BREAK_POLL_CYCLE: 'IOTA/POLLING/BREAK_POLL_CYCLE',
    FETCH_NODELIST_REQUEST: 'IOTA/POLLING/FETCH_NODELIST_REQUEST',
    FETCH_NODELIST_SUCCESS: 'IOTA/POLLING/FETCH_NODELIST_SUCCESS',
    FETCH_NODELIST_ERROR: 'IOTA/POLLING/FETCH_NODELIST_ERROR',
    FETCH_MARKET_DATA_REQUEST: 'IOTA/POLLING/FETCH_MARKET_DATA_REQUEST',
    FETCH_MARKET_DATA_SUCCESS: 'IOTA/POLLING/FETCH_MARKET_DATA_SUCCESS',
    FETCH_MARKET_DATA_ERROR: 'IOTA/POLLING/FETCH_MARKET_DATA_ERROR',
    ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_REQUEST: 'IOTA/POLLING/ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_REQUEST',
    ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_SUCCESS: 'IOTA/POLLING/ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_SUCCESS',
    ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_ERROR: 'IOTA/POLLING/ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_ERROR',
    PROMOTE_TRANSACTION_REQUEST: 'IOTA/POLLING/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'IOTA/POLLING/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'IOTA/POLLING/PROMOTE_TRANSACTION_ERROR',
    SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION: 'IOTA/POLLING/SYNC_ACCOUNT_BEFORE_AUTO_PROMOTION',
    SYNC_ACCOUNT_WHILE_POLLING: 'IOTA/POLLING/SYNC_ACCOUNT_WHILE_POLLING',
};

/** Progress bar action types */
export const ProgressActionTypes = {
    SET_NEXT_STEP_AS_ACTIVE: 'IOTA/PROGRESS/SET_NEXT_STEP_AS_ACTIVE',
    SET_ACTIVE_STEP_INDEX: 'IOTA/PROGRESS/SET_ACTIVE_STEP_INDEX',
    RESET: 'IOTA/PROGRESS/RESET',
    START_TRACKING_PROGRESS: 'IOTA/PROGRESS/START_TRACKING_PROGRESS',
};

/** Settings action types */
export const SettingsActionTypes = {
    SET_LOCALE: 'IOTA/SETTINGS/LOCALE',
    SET_NODE: 'IOTA/SETTINGS/FULLNODE',
    SET_CURRENCY: 'IOTA/SETTINGS/SET_CURRENCY',
    SET_NODE_REQUEST: 'IOTA/SETTINGS/SET_NODE_REQUEST',
    SET_NODE_ERROR: 'IOTA/SETTINGS/SET_NODE_ERROR',
    ADD_CUSTOM_NODE_REQUEST: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_REQUEST',
    ADD_CUSTOM_NODE_SUCCESS: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_SUCCESS',
    ADD_CUSTOM_NODE_ERROR: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_ERROR',
    REMOVE_CUSTOM_NODE: 'IOTA/SETTINGS/REMOVE_CUSTOM_NODE',
    SET_MODE: 'IOTA/SETTINGS/SET_MODE',
    SET_THEME: 'IOTA/SETTINGS/SET_THEME',
    SET_LANGUAGE: 'IOTA/SETTINGS/SET_LANGUAGE',
    SET_CURRENCY_DATA: 'IOTA/SETTINGS/SET_CURRENCY_DATA',
    UPDATE_THEME: 'IOTA/SETTINGS/UPDATE_THEME',
    CURRENCY_DATA_FETCH_ERROR: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_ERROR',
    SET_RANDOMLY_SELECTED_NODE: 'IOTA/SETTINGS/SET_RANDOMLY_SELECTED_NODE',
    SET_NODELIST: 'IOTA/SETTINGS/SET_NODELIST',
    SET_REMOTE_POW: 'IOTA/SETTINGS/SET_REMOTE_POW',
    SET_POW_NODE: 'IOTA/SETTINGS/SET_POW_NODE',
    SET_AUTO_PROMOTION: 'IOTA/SETTINGS/SET_AUTO_PROMOTION',
    UPDATE_AUTO_NODE_SWITCHING: 'IOTA/SETTINGS/UPDATE_AUTO_NODE_SWITCHING',
    SET_LOCK_SCREEN_TIMEOUT: 'IOTA/SETTINGS/SET_LOCK_SCREEN_TIMEOUT',
    SET_VERSIONS: 'IOTA/SETTINGS/WALLET/SET_VERSIONS',
    WALLET_RESET: 'IOTA/SETTINGS/WALLET/RESET',
    SET_FINGERPRINT_STATUS: 'IOTA/SETTINGS/SET_FINGERPRINT_STATUS',
    ACCEPT_TERMS: 'IOTA/SETTINGS/ACCEPT_TERMS',
    ACCEPT_PRIVACY: 'IOTA/SETTINGS/ACCEPT_PRIVACY',
    TOGGLE_EMPTY_TRANSACTIONS: 'IOTA/SETTINGS/TOGGLE_EMPTY_TRANSACTIONS',
    SET_COMPLETED_FORCED_PASSWORD_UPDATE: 'IOTA/SETTINGS/SET_COMPLETED_FORCED_PASSWORD_UPDATE',
    SET_BYTETRIT_STATUS: 'IOTA/SETTINGS/SET_BYTETRIT_STATUS',
    SET_BYTETRIT_INFO: 'IOTA/SETTINGS/SET_BYTETRIT_INFO',
    SET_TRAY: 'IOTA/SETTINGS/SET_TRAY',
    SET_NOTIFICATIONS: 'IOTA/SETTINGS/SET_NOTIFICATIONS',
    SET_PROXY: 'SET_PROXY',
    RESET_NODES_LIST: 'IOTA/SETTINGS/RESET_NODES_LIST',
    SET_DEEP_LINKING: 'IOTA/SETTINGS/SET_DEEP_LINKING',
    UPDATE_QUORUM_CONFIG: 'IOTA/SETTINGS/UPDATE_QUORUM_CONFIG',
    UPDATE_NODE_AUTO_SWITCH_SETTING: 'IOTA/SETTINGS/UPDATE_NODE_AUTO_SWITCH_SETTING',
    UPDATE_POW_NODE_AUTO_SWITCH_SETTING: 'IOTA/SETTINGS/UPDATE_POW_NODE_AUTO_SWITCH_SETTING',
    UPDATE_AUTO_NODE_LIST_SETTING: 'IOTA/SETTINGS/UPDATE_AUTO_NODE_LIST_SETTING',
    SET_CHART_CURRENCY: 'IOTA/SETTINGS/SET_CHART_CURRENCY',
    SET_CHART_TIMEFRAME: 'IOTA/SETTINGS/SET_CHART_TIMEFRAME',
};

/** Transfers action types */
export const TransfersActionTypes = {
    PROMOTE_TRANSACTION_REQUEST: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
    PROMOTE_TRANSACTION_SUCCESS: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS',
    PROMOTE_TRANSACTION_ERROR: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR',
    SEND_TRANSFER_REQUEST: 'IOTA/TRANSFERS/SEND_TRANSFER_REQUEST',
    SEND_TRANSFER_SUCCESS: 'IOTA/TRANSFERS/SEND_TRANSFER_SUCCESS',
    SEND_TRANSFER_ERROR: 'IOTA/TRANSFERS/SEND_TRANSFER_ERROR',
    RETRY_FAILED_TRANSACTION_REQUEST: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_REQUEST',
    RETRY_FAILED_TRANSACTION_SUCCESS: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_SUCCESS',
    RETRY_FAILED_TRANSACTION_ERROR: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_ERROR',
};

/** UI action types */
export const UiActionTypes = {
    SET_SEND_ADDRESS_FIELD: 'IOTA/UI/SET_SEND_ADDRESS_FIELD',
    SET_SEND_AMOUNT_FIELD: 'IOTA/UI/SET_SEND_AMOUNT_FIELD',
    SET_SEND_MESSAGE_FIELD: 'IOTA/UI/SET_SEND_MESSAGE_FIELD',
    CLEAR_SEND_FIELDS: 'IOTA/UI/CLEAR_SEND_FIELDS',
    SET_SEND_DENOMINATION: 'IOTA/UI/SET_SEND_DENOMINATION',
    SET_USER_ACTIVITY: 'IOTA/UI/SET_USER_ACTIVITY',
    SET_DO_NOT_MINIMISE: 'IOTA/UI/SET_DO_NOT_MINIMISE',
    TOGGLE_MODAL_ACTIVITY: 'IOTA/UI/TOGGLE_MODAL_ACTIVITY',
    UPDATE_MODAL_PROPS: 'IOTA/UI/UPDATE_MODAL_PROPS',
    SET_LOGIN_ROUTE: 'IOTA/UI/SET_LOGIN_ROUTE',
    SET_QR_MESSAGE: 'IOTA/UI/SET_QR_MESSAGE',
    SET_QR_AMOUNT: 'IOTA/UI/SET_QR_AMOUNT',
    SET_QR_TAG: 'IOTA/UI/SET_QR_TAG',
    SET_QR_DENOMINATION: 'IOTA/UI/SET_QR_DENOMINATION',
    SET_SELECTED_QR_TAB: 'IOTA/UI/SET_SELECTED_QR_TAB',
    SET_ROUTE: 'IOTA/UI/SET_ROUTE',
    SET_KEYBOARD_ACTIVITY: 'IOTA/UI/SET_KEYBOARD_ACTIVITY',
    SET_ANIMATE_CHART_ON_MOUNT: 'IOTA/UI/SET_ANIMATE_CHART_ON_MOUNT',
    SET_CDA_CONTENT: 'IOTA/UI/SET_CDA_CONTENT',
};

/** Wallet action types */
export const WalletActionTypes = {
    GENERATE_NEW_ADDRESS_REQUEST: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_REQUEST',
    GENERATE_NEW_ADDRESS_SUCCESS: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_SUCCESS',
    GENERATE_NEW_ADDRESS_ERROR: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_ERROR',
    SET_ACCOUNT_NAME: 'IOTA/WALLET/SET_ACCOUNT_NAME',
    SET_RECEIVE_ADDRESS: 'IOTA/WALLET/SET_RECEIVE_ADDRESS',
    SET_PASSWORD: 'IOTA/WALLET/SET_PASSWORD',
    CLEAR_WALLET_DATA: 'IOTA/WALLET/CLEAR_WALLET_DATA',
    SET_SEED_INDEX: 'IOTA/WALLET/SET_SEED_INDEX',
    SET_READY: 'IOTA/WALLET/SET_READY',
    SET_SETTING: 'IOTA/WALLET/SET_SETTING',
    SNAPSHOT_TRANSITION_REQUEST: 'IOTA/WALLET/SNAPSHOT_TRANSITION_REQUEST',
    SNAPSHOT_TRANSITION_SUCCESS: 'IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS',
    SNAPSHOT_TRANSITION_ERROR: 'IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR',
    SNAPSHOT_ATTACH_TO_TANGLE_REQUEST: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_REQUEST',
    SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE',
    UPDATE_TRANSITION_BALANCE: 'IOTA/WALLET/UPDATE_TRANSITION_BALANCE',
    UPDATE_TRANSITION_ADDRESSES: 'IOTA/WALLET/UPDATE_TRANSITION_ADDRESSES',
    SET_BALANCE_CHECK_FLAG: 'IOTA/WALLET/SET_BALANCE_CHECK_FLAG',
    CANCEL_SNAPSHOT_TRANSITION: 'IOTA/WALLET/CANCEL_SNAPSHOT_TRANSITION',
    CONNECTION_CHANGED: 'IOTA/WALLET/CONNECTION_CHANGED',
    SHOULD_UPDATE: 'IOTA/APP/WALLET/SHOULD_UPDATE',
    FORCE_UPDATE: 'IOTA/APP/WALLET/FORCE_UPDATE',
    DISPLAY_TEST_WARNING: 'IOTA/APP/WALLET/DISPLAY_TEST_WARNING',
    INITIATE_DEEP_LINK_REQUEST: 'IOTA/APP/WALLET/INITIATE_DEEP_LINK_REQUEST',
    SET_DEEP_LINK_CONTENT: 'IOTA/APP/WALLET/SET_DEEP_LINK_CONTENT',
    COMPLETE_DEEP_LINK_REQUEST: 'IOTA/APP/WALLET/COMPLETE_DEEP_LINK_REQUEST',
    MAP_STORAGE_TO_STATE: 'IOTA/SETTINGS/MAP_STORAGE_TO_STATE',
    ADDRESS_VALIDATION_REQUEST: 'IOTA/APP/WALLET/ADDRESS_VALIDATION_REQUEST',
    ADDRESS_VALIDATION_SUCCESS: 'IOTA/APP/WALLET/ADDRESS_VALIDATION_SUCCESS',
    PUSH_ROUTE: 'IOTA/APP/WALLET/PUSH_ROUTE',
    POP_ROUTE: 'IOTA/APP/WALLET/POP_ROUTE',
    POP_TO_ROUTE: 'IOTA/APP/WALLET/POP_TO_ROUTE',
    RESET_ROUTE: 'IOTA/APP/WALLET/RESET_ROUTE',
    DISPLAY_SEED_MIGRATION_ALERT: 'DISPLAY_SEED_MIGRATION_ALERT',
};

/** Sweeps action types */
export const SweepsActionTypes = {
    SET_SWEEPS_STATUSES: 'IOTA/SWEEPS/SET_SWEEPS_STATUSES',
    UPDATE_SWEEPS_STATUSES: 'IOTA/SWEEPS/UPDATE_SWEEPS_STATUSES',
    RECOVER_FUNDS_REQUEST: 'IOTA/SWEEPS/RECOVER_FUNDS_REQUEST',
    RECOVER_FUNDS_COMPLETE: 'IOTA/SWEEPS/RECOVER_FUNDS_COMPLETE',
    SET_CURRENT_SWEEP_ITERATION: 'IOTA/SWEEPS/SET_CURRENT_SWEEP_ITERATION',
    SET_TOTAL_SWEEP_ITERATIONS: 'IOTA/SWEEPS/SET_TOTAL_SWEEP_ITERATIONS',
};
