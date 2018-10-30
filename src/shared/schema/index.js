/**
 * Schema to define the structure of a Transaction
 * Transactions are indexed and looked up by hash
 */
export const TransactionSchema = {
    name: 'Transaction',
    primaryKey: 'hash', // Index and look up transactions by their hash
    properties: {
        hash: 'string',
        signatureMessageFragment: 'string',
        address: 'Address',
        value: 'int',
        timestamp: 'int',
        currentIndex: 'int',
        lastIndex: 'int',
        tag: 'string',
        trunkTransaction: 'string',
        branchTransaction: 'string',
        message: 'string',
        bundle: 'string',
        persistence: 'string',
        broadcasted: { type: 'bool', default: true },
    },
};

export const WalletSchema = {
    name: 'Wallet',
    properties: {
        /**
         * Determines if wallet has completed onboarding.
         */
        onboardingComplete: {
            type: 'bool',
            default: false,
        },
        /**
         * Error notifications log.
         */
        errorsLog: {
            type: 'list',
            objectType: 'string',
        },
        /**
         * Wallet settings.
         */
        settings: 'WalletSettings',
    },
};

/**
 * Notifications settings schema (TODO: Add description for general, confirmations, messages)
 */
export const NotificationsSettingsSchema = {
    name: 'NotificationsSettings',
    properties: {
        general: {
            type: 'bool',
            default: true,
        },
        confirmations: {
            type: 'bool',
            default: true,
        },
        messages: {
            type: 'bool',
            default: true,
        },
    },
};

/**
 * Schema to define the structure of an Address
 * Addresses are indexed and looked up by address
 */
export const AddressSchema = {
    name: 'Address',
    primaryKey: 'address',
    properties: {
        address: 'string',
        index: 'int',
        balance: 'int',
        checksum: 'string',
        spent: 'AddressSpendStatus',
    },
};

export const AddressSpendStatusSchema = {
    name: 'AddressSpendStatus',
    properties: {
        local: 'bool',
        remote: 'bool',
    },
};

export const AccountSchema = {
    name: 'Account',
    primaryKey: 'name',
    properties: {
        type: { type: 'string', default: 'keychain' },
        name: 'string',
        addressData: 'Address[]',
        transactions: 'Transaction[]',
        usedExistingSeed: { type: 'bool', default: false },
        displayedSnapshotTransitionGuide: { type: 'bool', default: false },
    },
};

export const WalletSettingsSchema = {
    name: 'WalletSettings',
    properties: {
        /**
         * Current wallet's version.
         */
        version: {
            type: 'string',
            default: '',
        },
        /**
         * Current wallet's build number (mobile).
         */
        buildNumber: {
            type: 'string',
            default: '',
        },
        /**
         * Selected locale for wallet.
         */
        locale: {
            type: 'string',
            default: 'en',
        },
        /**
         * Active wallet mode.
         * Could either be "Expert" or "Standard".
         */
        mode: {
            type: 'string',
            default: 'Standard',
        },
        /**
         * Selected language name.
         */
        language: {
            type: 'string',
            default: 'English (International)',
        },
        /**
         * Selected currency for conversions in wallet.
         */
        currency: {
            type: 'string',
            default: 'USD',
        },
        /**
         * Conversion rate for IOTA token.
         */
        conversionRate: {
            type: 'int',
            default: 1,
        },
        /**
         * Active theme name.
         */
        themeName: {
            type: 'string',
            default: 'Default',
        },
        /**
         * Determines if the wallet has randomised node on initial setup.
         */
        hasRandomizedNode: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if proof of work should be offloaded to the selected IRI node.
         */
        remotePoW: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if polling should auto promote unconfirmed transactions.
         */
        autoPromotion: {
            type: 'bool',
            default: true,
        },
        /**
         * Determines the time for locking user out of dashboard screens to lock/login screen.
         */
        lockScreenTimeout: {
            type: 'int',
            default: 3,
        },
        /**
         * Determines if wallet should automatically switch to a healthy node in case of errors.
         */
        autoNodeSwitching: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if user has enabled two factor authentication on the wallet.
         */
        is2FAEnabled: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if user has enabled finger print authentication.
         */
        isFingerPrintEnabled: {
            type: 'bool',
            default: false,
        },
        /**
         * Keeps track if user has accepted terms and conditions during the initial setup.
         */
        acceptedTerms: {
            type: 'bool',
            default: false,
        },
        /**
         * Keeps track if a user has accepted privacy agreement during the initial setup.
         */
        acceptedPrivacy: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if wallet should hide empty transactions on history screens.
         */
        hideEmptyTransactions: {
            type: 'bool',
            default: false,
        },
        /**
         * Determines if the tray app is enabled on desktop wallet.
         */
        isTrayEnabled: {
            type: 'bool',
            default: true,
        },
        /**
         * Determines the status of byte-trit check.
         */
        completedByteTritSweep: {
            type: 'bool',
            default: false,
        },
        /**
         * Notification settings for wallet.
         */
        notifications: 'NotificationsSettings',
    },
};

export const ChartDataSchema = {
    name: 'ChartData',
    primaryKey: 'currency',
    properties: {
        currency: 'string',
        data: 'DataForTimeframe[]',
    },
};

export const DataForTimeframeSchema = {
    name: 'DataForTimeframe',
    primaryKey: 'timeframe',
    properties: {
        timeframe: 'string',
        data: 'DataPoint[]',
    },
};

export const DataPointSchema = {
    name: 'DataPoint',
    primaryKey: 'id',
    properties: {
        id: 'string',
        x: 'int',
        y: 'float',
        time: 'int',
    },
};

export const NodeSchema = {
    name: 'Node',
    primaryKey: 'url',
    properties: {
        url: 'string', // Node URL
        custom: 'bool', // Whether the node was added by the user
        remotePow: { type: 'bool', default: false }, // Whether the node supports remote PoW
    },
};
