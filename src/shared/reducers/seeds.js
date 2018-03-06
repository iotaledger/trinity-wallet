import { ActionTypes } from '../actions/seeds.js';

const initialState = {
    selectedSeedIndex: null,
    items: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.ADD_SEED: {
            const items = [].concat(state.items, {
                name: action.payload.name,
                seed: action.payload.seed,
            });
            return {
                ...state,
                items,
            };
        }

        case ActionTypes.SELECT_SEED:
            return {
                ...state,
                selectedSeedIndex: action.payload,
            };

        case ActionTypes.REMOVE_SEED: {
            const items = [].concat(state.items).filter((item) => item.seed !== action.payload);
            return {
                ...state,
                items,
            };
        }

        case ActionTypes.PATCH_SEED: {
            const items = [].concat(state.items);
            items[action.payload.index] = {
                ...items[action.payload.index],
                ...action.payload.values,
            };
            return {
                ...state,
                items,
            };
        }

        case ActionTypes.CLEAR: {
            return initialState;
        }

        case ActionTypes.LOAD_SEEDS: {
            return action.payload || state;
        }
    }

    return state;
};
