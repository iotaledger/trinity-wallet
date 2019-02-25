import { addressData } from './addresses';
import transactions from './transactions';

export const NAME = 'TEST';

export default {
    onboardingComplete: true,
    accountInfo: {
        [NAME]: {
            addressData,
            transactions,
            type: 'ledger',
        },
    },
    setupInfo: {
        [NAME]: {
            usedExistingSeed: true,
        },
    },
    tasks: {
        [NAME]: {
            displayedSnapshotTransitionGuide: true,
        },
    },
};
