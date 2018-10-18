import { addressData } from './addresses';
import transactions from './transactions';

const TEST_ACCOUNT_NAME = 'TEST';

export default {
    onboardingComplete: true,
    accountInfo: {
        [TEST_ACCOUNT_NAME]: {
            addressData,
            transactions,
            type: 'ledger',
        },
    },
    setupInfo: {
        [TEST_ACCOUNT_NAME]: {
            usedExistingSeed: true,
        },
    },
    tasks: {
        [TEST_ACCOUNT_NAME]: {
            displayedSnapshotTransitionGuide: true,
        },
    },
};
