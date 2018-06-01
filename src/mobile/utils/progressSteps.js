import i18next from '../i18next';

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
};
