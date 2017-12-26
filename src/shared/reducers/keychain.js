import merge from 'lodash/merge';
import { ActionTypes } from '../actions/keychain';

const initialState = {
    isGettingSensitiveInfo: {
        receive: {
            addressGeneration: false,
        },
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.IS_GETTING_SENSITIVE_INFO_REQUEST:
            return {
                ...state,
                isGettingSensitiveInfo: merge({}, state.isGettingSensitiveInfo, {
                    [action.screen]: {
                        [action.purpose]: true,
                    },
                }),
            };
        case ActionTypes.IS_GETTING_SENSITIVE_INFO_SUCCESS:
        case ActionTypes.IS_GETTING_SENSITIVE_INFO_ERROR:
            return {
                ...state,
                isGettingSensitiveInfo: merge({}, state.isGettingSensitiveInfo, {
                    [action.screen]: {
                        [action.purpose]: false,
                    },
                }),
            };
        default:
            return state;
    }
};
