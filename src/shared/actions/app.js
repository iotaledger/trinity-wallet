export const ActionTypes = {
    SET_ONBOARDING_COMPLETED: 'IOTA/APP/ONBOARDING/COMPLETE',
    WALLET_LOGOUT: 'IOTA/APP/WALLET/LOGOUT',
    WALLET_RESET: 'IOTA/APP/WALLET/RESET',
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

export function resetWallet() {
    return {
        type: ActionTypes.WALLET_RESET,
    };
}
