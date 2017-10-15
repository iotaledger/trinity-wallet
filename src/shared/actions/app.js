export const ActionTypes = {
    SET_ONBOARDING_COMPLETED: 'IOTA/APP/ONBOARDING/COMPLETE',
};

export function setOnboardingCompleted() {
    return {
        type: ActionTypes.SET_ONBOARDING_COMPLETED,
    };
}
