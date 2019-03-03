export default {
    valueTransaction: [
        'progressSteps:validatingReceiveAddress',
        'progressSteps:syncingAccount',
        'progressSteps:preparingInputs',
        'progressSteps:preparingTransfers',
        'progressSteps:gettingTransactionsToApprove',
        'progressSteps:proofOfWork',
        'progressSteps:validatingTransactionAddresses',
        'progressSteps:broadcasting',
    ],
    zeroValueTransaction: [
        'progressSteps:preparingTransfers',
        'progressSteps:gettingTransactionsToApprove',
        'progressSteps:proofOfWork',
        'progressSteps:broadcasting',
    ],
    migration: [
        'progressSteps:preparingData',
        'progressSteps:migratingSettings',
        'progressSteps:migratingAccounts',
        'progressSteps:cleaningUpOldData',
        'progressSteps:migrationComplete',
    ],
};
