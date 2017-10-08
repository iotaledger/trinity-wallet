import { ActionTypes } from '../actions/seeds.js';

const initialState = {
    selectedSeed: null,
    seeds: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.ADD_SEED:
            // TODO: to be implemented
            return state;
    }

    return state;
};
