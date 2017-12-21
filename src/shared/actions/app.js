export const ActionTypes = {
    SET_ONBOARDING_COMPLETED: 'IOTA/APP/ONBOARDING/COMPLETE',
    WALLET_LOGOUT: 'IOTA/APP/WALLET/LOGOUT',
    WALLET_RESET: 'IOTA/APP/WALLET/RESET',
    SET_USER_ACTIVITY: 'IOTA/APP/WALLET/ACTIVITY',
};

export function setOnboardingCompletionStatus(isCompleted = false) {
    return {
        type: ActionTypes.SET_ONBOARDING_COMPLETED,
        payload: isCompleted,
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

export function setUserActivity() {
    return {
        type: ActionTypes.SET_USER_ACTIVITY,
    };
}
