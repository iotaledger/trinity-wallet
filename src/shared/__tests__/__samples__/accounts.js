import { addressData } from './addresses';
import transactions from './transactions';

export const NAME = 'TEST';
export const TYPE = 'ledger';

export default {
    onboardingComplete: true,
    accountInfo: {
        [NAME]: {
            addressData,
            transactions,
            meta: { type: TYPE },
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
