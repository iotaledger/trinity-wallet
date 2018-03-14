import { ActionTypes } from '../actions/seeds.js';

const initialState = {
   seeds: [],
   newSeed: null,
   newName: ''
};

export default (state = initialState, action) => {

   switch (action.type) {

      case ActionTypes.SEEDS_SET: {
         return {
            ...state,
            seeds: action.payload,
         };
      }

      case ActionTypes.SEEDS_ADD: {
         const seeds = [].concat(state.seeds, action.payload);
         return {
            ...state,
            seeds: seeds,
         };
      }

      case ActionTypes.SEEDS_REMOVE: {
         const seeds = [].concat(state.seeds).filter((seed) => seed !== action.payload);
         return {
            ...state,
            seeds: seeds,
         };
      }

      case ActionTypes.SEEDS_CLEAR: {
         return initialState;
      }

      case ActionTypes.SEEDS_NEW_SEED: {
         return {
            ...state,
            newSeed: action.payload
         };
      }

      case ActionTypes.SEEDS_NEW_NAME: {
         return {
            ...state,
            newName: action.payload
         };
      }

      case ActionTypes.SEEDS_NEW_CLEAR: {
         return {
            ...state,
            newSeed: null,
            newName: null
         };
      }

   }

   return state;
};
