import merge from 'lodash/merge';
import { KeychainActionTypes } from '../types';

const initialState = {
    /**
     * Determines if keychain/keystore information is being accessed on mobile
     */
    isGettingSensitiveInfo: {
        receive: {
            addressGeneration: false,
        },
        send: {
            makeTransaction: false,
        },
    },
};

export default (state = initialState, action) => {
    switch (action.type) {
        case KeychainActionTypes.IS_GETTING_SENSITIVE_INFO_REQUEST:
            return {
                ...state,
                isGettingSensitiveInfo: merge({}, state.isGettingSensitiveInfo, {
                    [action.screen]: {
                        [action.purpose]: true,
                    },
                }),
            };
        case KeychainActionTypes.IS_GETTING_SENSITIVE_INFO_SUCCESS:
        case KeychainActionTypes.IS_GETTING_SENSITIVE_INFO_ERROR:
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
