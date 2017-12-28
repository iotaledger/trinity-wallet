import findIndex from 'lodash/findIndex';
import isNumber from 'lodash/isNumber';
import { ActionTypes } from '../actions/polling';

const setNextPollIfSuccessful = state => {
    const { allPollingServices, pollFor } = state;

    const currentIndex = findIndex(allPollingServices, svc => pollFor === svc);

    if (isNumber(currentIndex)) {
        if (currentIndex === allPollingServices.length - 1) {
            return { pollFor: allPollingServices[0], retryCount: 0 };
        }

        return { pollFor: allPollingServices[currentIndex + 1], retryCount: 0 };
    }

    return { pollFor: allPollingServices[0], retryCount: 0 }; // In case something bad happens, restart fresh
};

const setNextPollIfUnsuccessful = state => {
    const { allPollingServices, pollFor, retryCount } = state;

    if (retryCount < 3) {
        return { retryCount: retryCount + 1 };
    }

    const currentIndex = findIndex(allPollingServices, svc => pollFor === svc);

    if (isNumber(currentIndex)) {
        if (currentIndex === allPollingServices.length - 1) {
            return { pollFor: allPollingServices[0], retryCount: 0 };
        }

        return { pollFor: allPollingServices[currentIndex + 1], retryCount: 0 };
    }

    return { pollFor: allPollingServices[0], retryCount: 0 };
};

const polling = (
    state = {
        allPollingServices: ['marketData', 'price', 'chartData', 'accountInfo'],
        pollFor: 'accountInfo',
        retryCount: 0,
        isFetchingPrice: false,
        isFetchingChartData: false,
        isFetchingMarketData: false,
        isFetchingAccountInfo: false,
    },
    action,
) => {
    switch (action.type) {
        case ActionTypes.FETCH_PRICE_REQUEST:
            return {
                ...state,
                isFetchingPrice: true,
            };
        case ActionTypes.FETCH_PRICE_SUCCESS:
            return {
                ...state,
                isFetchingPrice: false,
                ...setNextPollIfSuccessful(state),
            };
        case ActionTypes.FETCH_PRICE_ERROR:
            return {
                ...state,
                isFetchingPrice: false,
                ...setNextPollIfUnsuccessful(state),
            };
        case ActionTypes.FETCH_CHART_DATA_REQUEST:
            return {
                ...state,
                isFetchingChartData: true,
            };
        case ActionTypes.FETCH_CHART_DATA_SUCCESS:
            return {
                ...state,
                isFetchingChartData: false,
                ...setNextPollIfSuccessful(state),
            };
        case ActionTypes.FETCH_CHART_DATA_ERROR:
            return {
                ...state,
                isFetchingChartData: false,
                ...setNextPollIfUnsuccessful(state),
            };
        case ActionTypes.FETCH_MARKET_DATA_REQUEST:
            return {
                ...state,
                isFetchingMarketData: true,
            };
        case ActionTypes.FETCH_MARKET_DATA_SUCCESS:
            return {
                ...state,
                isFetchingMarketData: false,
                ...setNextPollIfSuccessful(state),
            };
        case ActionTypes.FETCH_MARKET_DATA_ERROR:
            return {
                ...state,
                isFetchingMarketData: false,
                ...setNextPollIfUnsuccessful(state),
            };
        case ActionTypes.ACCOUNT_INFO_FETCH_REQUEST:
            return {
                ...state,
                isFetchingAccountInfo: true,
            };
        case ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
            return {
                ...state,
                isFetchingAccountInfo: false,
                ...setNextPollIfSuccessful(state),
            };
        case ActionTypes.ACCOUNT_INFO_FETCH_ERROR:
            return {
                ...state,
                isFetchingAccountInfo: false,
                ...setNextPollIfUnsuccessful(state),
            };
        default:
            return state;
    }
};

export default polling;
