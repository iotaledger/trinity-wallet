import { expect } from 'chai';
import reducer from '../../reducers/marketData';
import { availableCurrencies } from '../../libs/currency';

describe('Reducer: marketData', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                chartData: {},
                mcap: '0',
                volume: '0',
                change24h: '0.00',
                usdPrice: 0,
                eurPrice: 0,
                btcPrice: 0,
                ethPrice: 0,
                rates: availableCurrencies,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('IOTA/MARKET_DATA/SET_PRICE', () => {
        it('should assign "usd" to "usdPrice" state prop', () => {
            const initialState = {
                usdPrice: 0,
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_PRICE',
                usd: 2,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                usdPrice: 2,
            };

            expect(newState.usdPrice).to.eql(expectedState.usdPrice);
        });

        it('should assign "eur" to "eurPrice" state prop', () => {
            const initialState = {
                eurPrice: 0,
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_PRICE',
                eur: 2,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                eurPrice: 2,
            };

            expect(newState.eurPrice).to.eql(expectedState.eurPrice);
        });

        it('should assign "btc" to "btcPrice" state prop', () => {
            const initialState = {
                btcPrice: 0,
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_PRICE',
                btc: 2,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                btcPrice: 2,
            };

            expect(newState.btcPrice).to.eql(expectedState.btcPrice);
        });

        it('should assign "eth" to "ethPrice" state prop', () => {
            const initialState = {
                ethPrice: 0,
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_PRICE',
                eth: 2,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ethPrice: 2,
            };

            expect(newState.ethPrice).to.eql(expectedState.ethPrice);
        });
    });

    describe('IOTA/MARKET_DATA/SET_STATISTICS', () => {
        it('should assign "mcap" to "mcap" state prop', () => {
            const initialState = {
                mcap: '0',
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_STATISTICS',
                mcap: '2',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                mcap: '2',
            };

            expect(newState.mcap).to.eql(expectedState.mcap);
        });

        it('should assign "volume" to "volume" state prop', () => {
            const initialState = {
                volume: '0',
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_STATISTICS',
                volume: '2',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                volume: '2',
            };

            expect(newState.volume).to.eql(expectedState.volume);
        });

        it('should assign "change24h" to "change24h" state prop', () => {
            const initialState = {
                change24h: '0.00',
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_STATISTICS',
                change24h: '0.02',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                change24h: '0.02',
            };

            expect(newState.change24h).to.eql(expectedState.change24h);
        });
    });

    describe('IOTA/MARKET_DATA/SET_CHART_DATA', () => {
        it('should assign "chartData" to "chartData" state prop', () => {
            const initialState = {
                chartData: {},
            };

            const action = {
                type: 'IOTA/MARKET_DATA/SET_CHART_DATA',
                chartData: { foo: {} },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                chartData: { foo: {} },
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
