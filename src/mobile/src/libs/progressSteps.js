export default {
    valueTransaction: [
        'progressSteps:validatingReceiveAddress',
        'progressSteps:syncingAccount',
        'progressSteps:preparingInputs',
        'progressSteps:preparingTransfers',
        'progressSteps:gettingTransactionsToApprove',
        'progressSteps:proofOfWork',
        'progressSteps:broadcasting',
    ],
    zeroValueTransaction: [
        'progressSteps:preparingTransfers',
        'progressSteps:gettingTransactionsToApprove',
        'progressSteps:proofOfWork',
        'progressSteps:broadcasting',
    ],
    migration: [
        i18next.t('progressSteps:preparingData'),
        i18next.t('progressSteps:migratingSettings'),
        i18next.t('progressSteps:migratingAccounts'),
        i18next.t('progressSteps:cleaningUpOldData'),
        i18next.t('progressSteps:migrationComplete'),
    ],
};
