import { defaultNode } from '../config';
import { availableCurrencies } from '../libs/currency';

/**
 * Schema to define the structure of a Transaction
 * Transactions are indexed and looked up by hash
 */
export const TransactionSchema = {
    name: 'Transaction',
    properties: {
        hash: 'string',
        signatureMessageFragment: 'string',
        address: 'string',
        value: 'int',
        obsoleteTag: 'string',
        timestamp: 'int',
        currentIndex: 'int',
        lastIndex: 'int',
        tag: 'string',
        trunkTransaction: 'string',
        branchTransaction: 'string',
        bundle: 'string',
        attachmentTimestamp: 'int',
        attachmentTimestampLowerBound: 'int',
        attachmentTimestampUpperBound: 'int',
        nonce: 'string',
        persistence: 'bool',
        broadcasted: { type: 'bool', default: true },
    },
};

export const WalletSchema = {
    name: 'Wallet',
    primaryKey: 'version',
    properties: {
        /**
         * Wallet's schema version
         */
        version: {
            type: 'int',
        },
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
        errorLog: 'ErrorLog[]',
        /**
         * Wallet settings.
         */
        settings: 'WalletSettings',
        /**
         * Temporarily stored account information while the account is being setup
         */
        accountInfoDuringSetup: 'AccountInfoDuringSetup',
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
 */
export const AddressSchema = {
    name: 'Address',
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

export const ErrorLogSchema = {
    name: 'ErrorLog',
    properties: {
        error: 'string',
        time: 'int',
    },
};

export const AccountSchema = {
    name: 'Account',
    primaryKey: 'name',
    properties: {
        meta: 'AccountMeta',
        index: 'int',
        name: 'string',
        addressData: 'Address[]',
        transactions: 'Transaction[]',
        usedExistingSeed: { type: 'bool', default: false },
        displayedSnapshotTransitionGuide: { type: 'bool', default: false },
    },
};

/**
 * Schema for wallet settings.
 */
export const WalletSettingsSchema = {
    name: 'WalletSettings',
    properties: {
        /**
         * Wallet versions (version & build number)
         */
        versions: 'WalletVersions',
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
        availableCurrencies: {
            type: 'list',
            objectType: 'string',
            default: availableCurrencies,
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
        isFingerprintEnabled: {
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
        /**
         * Selected IRI node for wallet.
         */
        node: {
            type: 'string',
            default: defaultNode,
        },
        /**
         * Determines the status of AsyncStorage to realm migration
         */
        completedMigration: {
            type: 'bool',
            default: false,
        },
    },
};

/**
 * Schema for Wallet versions.
 */
export const WalletVersionsSchema = {
    name: 'WalletVersions',
    primaryKey: 'version',
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
            type: 'int',
            optional: true,
        },
    },
};

/**
 * Schema for available nodes for wallet.
 */
export const NodeSchema = {
    name: 'Node',
    primaryKey: 'url',
    properties: {
        url: 'string', // Node URL
        // Whether the node was added by the user
        custom: {
            type: 'bool',
            default: false,
        },
        pow: { type: 'bool', default: false }, // Whether the node supports remote PoW
    },
};

/**
 * Schema for account information (while the account is being setup)
 */
export const AccountInfoDuringSetupSchema = {
    name: 'AccountInfoDuringSetup',
    properties: {
        name: {
            type: 'string',
            default: '',
        },
        usedExistingSeed: {
            type: 'bool',
            default: false,
        },
        meta: 'AccountMeta',
    },
};

/**
 * Schema for account meta
 */
export const AccountMetaSchema = {
    name: 'AccountMeta',
    properties: {
        type: {
            type: 'string',
            default: 'keychain',
        },
        index: {
            type: 'int',
            optional: true,
        },
        page: {
            type: 'int',
            optional: true,
        },
        indexAddress: {
            type: 'string',
            optional: true,
        },
    },
};

export default [
    TransactionSchema,
    WalletSchema,
    NotificationsSettingsSchema,
    AddressSchema,
    AddressSpendStatusSchema,
    ErrorLogSchema,
    AccountSchema,
    WalletSettingsSchema,
    WalletVersionsSchema,
    NodeSchema,
    AccountInfoDuringSetupSchema,
    AccountMetaSchema,
];
