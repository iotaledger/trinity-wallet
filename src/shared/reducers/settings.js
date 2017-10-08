import { ActionTypes } from '../actions/settings.js';

const initialState = {
    locale: 'en',
    fullNode: 'http://node01.iotatoken.nl:14265',
    availableNodes: [
        'https://n1.iota.nu:443',
        'https://node.tangle.works:443',
        'http://node.lukaseder.de:14265',
        'http://eugene.iotasupport.com:14999',
        'http://node02.iotatoken.nl:14265',
        'http://eugeneoldisoft.iotasupport.com:14265',
        'http://88.198.230.98:14265',
        'http://eugene.iota.community:14265',
        'http://node03.iotatoken.nl:15265',
        'http://wallets.iotamexico.com:80',
        'http://node01.iotatoken.nl:14265',
        'http://5.9.149.169:14265',
        'http://5.9.137.199:14265',
        'http://service.iotasupport.com:14265',
        'http://5.9.118.112:14265',
        'http://176.9.3.149:14265',
        'http://mainnet.necropaz.com:14500',
        'http://iota.bitfinex.com:80'
    ]
};

const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.LOCALE:
            return {
                ...state,
                locale: action.payload
            };

        case ActionTypes.SET_LOCALE:
            return {
                ...state,
                locale: action.payload
            };

        case ActionTypes.SET_FULLNODE:
            return {
                ...state,
                fullNode: action.payload
            };

        case ActionTypes.ADD_CUSTOM_NODE:
            return {
                ...state,
                availableNodes: state.availableNodes.includes(action.payload)
                    ? state.availableNodes
                    : [].concat(state.availableNodes, action.payload)
            };
    }

    return state;
};

export default settingsReducer;
