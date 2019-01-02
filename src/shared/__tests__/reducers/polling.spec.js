import assign from 'lodash/assign';
import { expect } from 'chai';
import reducer, { setNextPollIfSuccessful, setNextPollIfUnsuccessful } from '../../reducers/polling';
import { ActionTypes } from '../../actions/polling';

describe('Reducer: polling', () => {
    it('should have an initial state', () => {
        const initialState = {
            allPollingServices: ['promotion', 'marketData', 'price', 'chartData', 'nodeList', 'accountInfo'],
            pollFor: 'promotion',
            retryCount: 0,
            isFetchingPrice: false,
            isFetchingNodeList: false,
            isFetchingChartData: false,
            isFetchingMarketData: false,
            isFetchingAccountInfo: false,
            isAutoPromoting: false,
        };

        expect(reducer(undefined, {})).to.eql(initialState);
    });

    it('FETCH_PRICE_REQUEST should set isFetchingPrice to true', () => {
        const initialState = {
            isFetchingPrice: false,
        };

        const action = {
            type: ActionTypes.FETCH_PRICE_REQUEST,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingPrice: true,
        };

        expect(newState).to.eql(expectedState);
    });

    it('FETCH_PRICE_SUCCESS should set isFetchingPrice to false', () => {
        const initialState = {
            isFetchingPrice: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_PRICE_SUCCESS,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingPrice: false,
        };

        expect(newState.isFetchingPrice).to.eql(expectedState.isFetchingPrice);
    });

    it('FETCH_PRICE_ERROR should set isFetchingPrice to false', () => {
        const initialState = {
            isFetchingPrice: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_PRICE_ERROR,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingPrice: false,
        };

        expect(newState.isFetchingPrice).to.eql(expectedState.isFetchingPrice);
    });

    it('FETCH_NODELIST_REQUEST should set isFetchingNodeList to true', () => {
        const initialState = {
            isFetchingNodeList: false,
        };

        const action = {
            type: ActionTypes.FETCH_NODELIST_REQUEST,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingNodeList: true,
        };

        expect(newState).to.eql(expectedState);
    });

    it('FETCH_NODELIST_SUCCESS should set isFetchingNodeList to false', () => {
        const initialState = {
            isFetchingNodeList: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_NODELIST_SUCCESS,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingNodeList: false,
        };

        expect(newState.isFetchingNodeList).to.eql(expectedState.isFetchingNodeList);
    });

    it('FETCH_NODELIST_ERROR should set isFetchingNodeList to false', () => {
        const initialState = {
            isFetchingNodeList: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_NODELIST_ERROR,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingNodeList: false,
        };

        expect(newState.isFetchingNodeList).to.eql(expectedState.isFetchingNodeList);
    });

    it('FETCH_CHART_DATA_REQUEST should set isFetchingChartData to true', () => {
        const initialState = {
            isFetchingChartData: false,
        };

        const action = {
            type: ActionTypes.FETCH_CHART_DATA_REQUEST,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingChartData: true,
        };

        expect(newState).to.eql(expectedState);
    });

    it('FETCH_CHART_DATA_SUCCESS should set isFetchingChartData to false', () => {
        const initialState = {
            isFetchingChartData: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_CHART_DATA_SUCCESS,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingChartData: false,
        };

        expect(newState.isFetchingChartData).to.eql(expectedState.isFetchingChartData);
    });

    it('FETCH_CHART_DATA_ERROR should set isFetchingChartData to false', () => {
        const initialState = {
            isFetchingChartData: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_CHART_DATA_ERROR,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingChartData: false,
        };

        expect(newState.isFetchingChartData).to.eql(expectedState.isFetchingChartData);
    });

    it('FETCH_MARKET_DATA_REQUEST should set isFetchingMarketData to true', () => {
        const initialState = {
            isFetchingMarketData: false,
        };

        const action = {
            type: ActionTypes.FETCH_MARKET_DATA_REQUEST,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingMarketData: true,
        };

        expect(newState).to.eql(expectedState);
    });

    it('FETCH_MARKET_DATA_SUCCESS should set isFetchingMarketData to false', () => {
        const initialState = {
            isFetchingMarketData: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_MARKET_DATA_SUCCESS,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingMarketData: false,
        };

        expect(newState.isFetchingMarketData).to.eql(expectedState.isFetchingMarketData);
    });

    it('FETCH_MARKET_DATA_ERROR should set isFetchingMarketData to false', () => {
        const initialState = {
            isFetchingMarketData: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.FETCH_MARKET_DATA_ERROR,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingMarketData: false,
        };

        expect(newState.isFetchingMarketData).to.eql(expectedState.isFetchingMarketData);
    });

    it('ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_REQUEST should set isFetchingAccountInfo to true', () => {
        const initialState = {
            isFetchingAccountInfo: false,
        };

        const action = {
            type: ActionTypes.ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_REQUEST,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingAccountInfo: true,
        };

        expect(newState).to.eql(expectedState);
    });

    it('ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_SUCCESS should set isFetchingAccountInfo to false', () => {
        const initialState = {
            isFetchingAccountInfo: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_SUCCESS,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingAccountInfo: false,
        };

        expect(newState.isFetchingAccountInfo).to.eql(expectedState.isFetchingAccountInfo);
    });

    it('ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_ERROR should set isFetchingAccountInfo to false', () => {
        const initialState = {
            isFetchingAccountInfo: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.ACCOUNT_INFO_FOR_ALL_ACCOUNTS_FETCH_ERROR,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isFetchingAccountInfo: false,
        };

        expect(newState.isFetchingAccountInfo).to.eql(expectedState.isFetchingAccountInfo);
    });

    it('PROMOTE_TRANSACTION_REQUEST should set isAutoPromoting to true', () => {
        const initialState = {
            isAutoPromoting: false,
        };

        const action = {
            type: ActionTypes.PROMOTE_TRANSACTION_REQUEST,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isAutoPromoting: true,
        };

        expect(newState).to.eql(expectedState);
    });

    it('PROMOTE_TRANSACTION_SUCCESS should set isAutoPromoting to false', () => {
        const initialState = {
            isAutoPromoting: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.PROMOTE_TRANSACTION_SUCCESS,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isAutoPromoting: false,
        };

        expect(newState.isAutoPromoting).to.eql(expectedState.isAutoPromoting);
    });

    it('PROMOTE_TRANSACTION_ERROR should set isAutoPromoting to false', () => {
        const initialState = {
            isAutoPromoting: true,
            allPollingServices: [],
        };

        const action = {
            type: ActionTypes.PROMOTE_TRANSACTION_ERROR,
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            isAutoPromoting: false,
        };

        expect(newState.isAutoPromoting).to.eql(expectedState.isAutoPromoting);
    });

    it('SET_POLL_FOR should set pollFor to payload in action', () => {
        const initialState = {
            pollFor: 'foo',
        };

        const action = {
            type: ActionTypes.SET_POLL_FOR,
            payload: 'baz',
        };

        const newState = reducer(initialState, action);
        const expectedState = {
            pollFor: 'baz',
        };

        expect(newState).to.eql(expectedState);
    });

    describe('#setNetPollIfSuccessful', () => {
        let state;

        beforeEach(() => {
            state = {
                allPollingServices: ['marketData', 'price', 'chartData', 'accountInfo', 'promotion'],
                pollFor: 'marketData',
            };
        });

        describe('when pollFor value exists in allPollingServices array and value is not placed at last index', () => {
            it('should return an object with prop pollFor equals value of next element in allPollingServices and retryCount equals 0', () => {
                expect(setNextPollIfSuccessful(state)).to.eql({ pollFor: 'price', retryCount: 0 });
            });
        });

        describe('when pollFor value exists in allPollingServices array and value is placed at last index', () => {
            it('should return an object with prop pollFor equals value of zeroth element in allPollingServices and retryCount equals 0', () => {
                state = assign({}, state, { pollFor: 'promotion' });
                expect(setNextPollIfSuccessful(state)).to.eql({ pollFor: 'marketData', retryCount: 0 });
            });
        });

        describe('when pollFor value does not exist in allPollingServices array and value is placed at any index', () => {
            it('should return an object with prop pollFor equals value of zeroth element in allPollingServices and retryCount equals 0', () => {
                state = assign({}, state, { pollFor: 'foo' });
                expect(setNextPollIfSuccessful(state)).to.eql({ pollFor: 'marketData', retryCount: 0 });
            });
        });
    });

    describe('#setNextPollIfUnsuccessful', () => {
        let state;

        beforeEach(() => {
            state = {
                allPollingServices: ['marketData', 'price', 'chartData', 'accountInfo', 'promotion'],
                pollFor: 'marketData',
                retryCount: 0,
            };
        });

        describe('when retryCount is less than 3', () => {
            it('should return an object with retryCount equals an incremented value of retryCount by one', () => {
                expect(setNextPollIfUnsuccessful(state)).to.eql({ retryCount: 1 });
            });
        });

        describe('when retryCount is not less than 3', () => {
            describe('when pollFor value exists in allPollingServices array and value is not placed at last index', () => {
                it('should return an object with prop pollFor equals value of next element in allPollingServices and retryCount equals 0', () => {
                    state = assign({}, state, { retryCount: 3 });
                    expect(setNextPollIfSuccessful(state)).to.eql({ pollFor: 'price', retryCount: 0 });
                });
            });

            describe('when pollFor value exists in allPollingServices array and value is placed at last index', () => {
                it('should return an object with prop pollFor equals value of zeroth element in allPollingServices and retryCount equals 0', () => {
                    state = assign({}, state, { pollFor: 'promotion' });
                    expect(setNextPollIfSuccessful(state)).to.eql({ pollFor: 'marketData', retryCount: 0 });
                });
            });

            describe('when pollFor value does not exist in allPollingServices array and value is placed at any index', () => {
                it('should return an object with prop pollFor equals value of zeroth element in allPollingServices and retryCount equals 0', () => {
                    state = assign({}, state, { pollFor: 'foo' });
                    expect(setNextPollIfSuccessful(state)).to.eql({ pollFor: 'marketData', retryCount: 0 });
                });
            });
        });
    });
});
