const accountReducer = (
    state = {
        seedCount: 0,
        seedNames: [],
        firstUse: true,
        onboardingComplete: false,
    },
    action,
) => {
    switch (action.type) {
        case 'SET_FIRST_USE':
            return {
                ...state,
                firstUse: action.payload,
            };
        case 'SET_ONBOARDING_COMPLETE':
            return {
                ...state,
                onboardingComplete: action.payload,
            };
        case 'INCREASE_SEED_COUNT':
            return {
                ...state,
                seedCount: state.seedCount + 1,
            };
        case 'ADD_SEED':
            return {
                ...state,
                seedNames: [...state.seedNames, action.payload],
            };
        default:
            return state;
    }
};

export default accountReducer;
