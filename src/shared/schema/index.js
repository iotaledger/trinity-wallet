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
        broadcasted: { type: 'bool', default: true }
    },
};

export const WalletSchema = {
    name: 'Wallet',
    properties: {
        onboardingComplete: {
            type: 'bool',
            default: false
        }
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
        spent: 'AddressSpendStatus'
    },
};

export const AddressSpendStatusSchema = {
    name: 'AddressSpendStatus',
    properties: {
        local: 'bool',
        remote: 'bool'
    }
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
    }
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
