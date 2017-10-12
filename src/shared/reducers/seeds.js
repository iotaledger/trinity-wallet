import { ActionTypes } from '../actions/seeds.js';

const initialState = {
    selectedSeedIndex: null,
    items: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.ADD_SEED:
            const items = [].concat(state.items, action.payload);
            return {
                ...state,
                items,
            };

        case ActionTypes.SELECT_SEED:
            return {
                ...state,
                selectedSeedIndex: action.payload,
            };

        case ActionTypes.REMOVE_SEED: {
            const items = [].concat(state.items).filter(seed => seed !== action.payload);
            return {
                ...state,
                items,
            };
        }

        case ActionTypes.CLEAR: {
            return initialState;
        }
    }

    return state;
};
