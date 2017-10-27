export const ActionTypes = {
    SET_ONBOARDING_COMPLETED: 'IOTA/APP/ONBOARDING/COMPLETE',
    WALLET_LOGOUT: 'IOTA/APP/WALLET/LOGOUT',
};

export function setOnboardingCompleted() {
    return {
        type: ActionTypes.SET_ONBOARDING_COMPLETED,
    };
}

export function logoutFromWallet() {
    return {
        type: ActionTypes.WALLET_LOGOUT,
    };
}
