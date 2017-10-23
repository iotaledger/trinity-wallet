export const ActionTypes = {
    SET_ONBOARDING_COMPLETED: 'IOTA/APP/ONBOARDING/COMPLETE',
};

export function setOnboardingCompletionStatus(isCompleted = false) {
    return {
        type: ActionTypes.SET_ONBOARDING_COMPLETED,
        payload: isCompleted,
    };
}
