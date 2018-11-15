import i18next from 'shared-modules/libs/i18next';

export default {
    valueTransaction: [
        i18next.t('progressSteps:checkingNodeHealth'),
        i18next.t('progressSteps:validatingReceiveAddress'),
        i18next.t('progressSteps:syncingAccount'),
        i18next.t('progressSteps:preparingInputs'),
        i18next.t('progressSteps:preparingTransfers'),
        i18next.t('progressSteps:gettingTransactionsToApprove'),
        i18next.t('progressSteps:proofOfWork'),
        i18next.t('progressSteps:broadcasting'),
    ],
    zeroValueTransaction: [
        i18next.t('progressSteps:preparingTransfers'),
        i18next.t('progressSteps:gettingTransactionsToApprove'),
        i18next.t('progressSteps:proofOfWork'),
        i18next.t('progressSteps:broadcasting'),
    ],
    migration: [
        i18next.t('progressSteps:preparingData'),
        i18next.t('progressSteps:migratingSettings'),
        i18next.t('progressSteps:migratingAccounts'),
        i18next.t('progressSteps:cleaningUpOldData'),
        i18next.t('progressSteps:migrationComplete'),
    ],
};
