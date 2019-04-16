import { expect } from 'chai';
import reducer from '../../reducers/settings';
import { ActionTypes } from '../../actions/settings';
import { defaultNode, nodes } from '../../config';

describe('Reducer: settings', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                completedByteTritSweep: false,
                locale: 'en',
                node: defaultNode,
                nodes,
                customNodes: [],
                mode: 'Standard',
                language: 'English (International)',
                currency: 'USD',
                autoNodeSwitching: false,
                availableCurrencies: [
                    'USD',
                    'GBP',
                    'EUR',
                    'AUD',
                    'BGN',
                    'BRL',
                    'CAD',
                    'CHF',
                    'CNY',
                    'CZK',
                    'DKK',
                    'HKD',
                    'HRK',
                    'HUF',
                    'IDR',
                    'ILS',
                    'INR',
                    'ISK',
                    'JPY',
                    'KRW',
                    'MXN',
                    'MYR',
                    'NOK',
                    'NZD',
                    'PHP',
                    'PLN',
                    'RON',
                    'RUB',
                    'SEK',
                    'SGD',
                    'THB',
                    'TRY',
                    'ZAR',
                ],
                conversionRate: 1,
                themeName: 'Default',
                hasRandomizedNode: false,
                remotePoW: false,
                lockScreenTimeout: 3,
                versions: {},
                isFingerprintEnabled: false,
                acceptedTerms: false,
                acceptedPrivacy: false,
                autoPromotion: true,
                hideEmptyTransactions: false,
                isTrayEnabled: true,
                notifications: {
                    general: true,
                    confirmations: true,
                    messages: true,
                },
                completedMigration: false,
                ignoreProxy: false,
                deepLinking: false,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe(ActionTypes.SET_LOCK_SCREEN_TIMEOUT, () => {
        it('should set lockScreenTimeout to payload', () => {
            const initialState = {
                lockScreenTimeout: 0,
            };

            const action = {
                type: ActionTypes.SET_LOCK_SCREEN_TIMEOUT,
                payload: 100,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                lockScreenTimeout: 100,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_REMOTE_POW, () => {
        it('should update remotePoW in state', () => {
            const initialState = {
                remotePoW: false,
            };

            const action = {
                type: ActionTypes.SET_REMOTE_POW,
                payload: true,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                remotePoW: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_AUTO_PROMOTION, () => {
        it('should update autoPromotion in state', () => {
            const initialState = {
                autoPromotion: false,
            };

            const action = {
                type: ActionTypes.SET_AUTO_PROMOTION,
                payload: true,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                autoPromotion: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.UPDATE_AUTO_NODE_SWITCHING, () => {
        describe('when action.payload is defined', () => {
            it('should set autoNodeSwitching to action.payload', () => {
                const initialState = {
                    autoNodeSwitching: false,
                };

                const action = {
                    type: ActionTypes.UPDATE_AUTO_NODE_SWITCHING,
                    payload: true,
                };

                const newState = reducer(initialState, action);

                const expectedState = {
                    autoNodeSwitching: true,
                };

                expect(newState).to.eql(expectedState);
            });
        });

        describe('when action.payload in undefined', () => {
            it('should invert state.autoNodeSwitching', () => {
                const initialState = {
                    autoNodeSwitching: false,
                };

                const action = {
                    type: ActionTypes.UPDATE_AUTO_NODE_SWITCHING,
                };

                const newState = reducer(initialState, action);

                const expectedState = {
                    autoNodeSwitching: true,
                };

                expect(newState).to.eql(expectedState);
            });
        });
    });

    describe(ActionTypes.SET_LOCALE, () => {
        it('should set locale to payload', () => {
            const initialState = {
                locale: 'en',
            };

            const action = {
                type: ActionTypes.SET_LOCALE,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                locale: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_NODE, () => {
        it('should set node to action.payload', () => {
            const initialState = {
                node: 'http://localhost:9000',
            };

            const action = {
                type: ActionTypes.SET_NODE,
                payload: 'http://localhost:8000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                node: 'http://localhost:8000',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.ADD_CUSTOM_NODE_SUCCESS, () => {
        describe('when payload exists in "nodes" state prop', () => {
            it('should return existing state prop "nodes"', () => {
                const initialState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000'],
                    customNodes: [],
                };

                const action = {
                    type: ActionTypes.ADD_CUSTOM_NODE_SUCCESS,
                    payload: 'http://localhost:9000',
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000'],
                    customNodes: [],
                };

                expect(newState.nodes).to.eql(expectedState.nodes);
            });
        });

        describe('when payload does not exist in "nodes" state prop', () => {
            it('should add payload to state prop "nodes" and "customNodes"', () => {
                const initialState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000'],
                    customNodes: [],
                };

                const action = {
                    type: ActionTypes.ADD_CUSTOM_NODE_SUCCESS,
                    payload: 'http://localhost:3000',
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000', 'http://localhost:3000'],
                    customNodes: ['http://localhost:3000'],
                };

                expect(newState.nodes).to.eql(expectedState.nodes);
                expect(newState.customNodes).to.eql(expectedState.customNodes);
            });
        });
    });

    describe(ActionTypes.REMOVE_CUSTOM_NODE, () => {
        describe('when payload exists in "customNodes" state prop', () => {
            it('should remove payload from state prop "customNodes"', () => {
                const initialState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000'],
                    customNodes: ['http://localhost:5000'],
                };

                const action = {
                    type: ActionTypes.REMOVE_CUSTOM_NODE,
                    payload: 'http://localhost:5000',
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    nodes: ['http://localhost:9000'],
                    customNodes: [],
                };

                expect(newState.nodes).to.eql(expectedState.nodes);
                expect(newState.customNodes).to.eql(expectedState.customNodes);
            });
        });

        describe('when payload does not exist in "customNodes" state prop', () => {
            it('should not change "customNodes" state prop', () => {
                const initialState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000'],
                    customNodes: ['http://localhost:4000'],
                };

                const action = {
                    type: ActionTypes.REMOVE_CUSTOM_NODE,
                    payload: 'http://localhost:5000',
                };

                const newState = reducer(initialState, action);

                expect(newState.nodes).to.eql(initialState.nodes);
                expect(newState.customNodes).to.eql(initialState.customNodes);
            });
        });
    });

    describe(ActionTypes.SET_NODELIST, () => {
        it('should update nodes with a union of action.payload, state.customNodes and state.node', () => {
            const node = 'http://localhost:9000';
            const customNodes = ['http://localhost:5000', 'http://localhost:4000'];

            const initialState = {
                node,
                customNodes,
            };

            const action = {
                type: ActionTypes.SET_NODELIST,
                payload: ['http://localhost:5000', 'http://localhost:80'],
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                nodes: [
                    'http://localhost:5000',
                    'http://localhost:80',
                    'http://localhost:4000',
                    'http://localhost:9000',
                ],
                node,
                customNodes,
            };

            expect(newState.nodes).to.eql(expectedState.nodes);
        });
    });

    describe(ActionTypes.SET_MODE, () => {
        it('should set mode to payload', () => {
            const initialState = {
                mode: 'Expert',
            };

            const action = {
                type: ActionTypes.SET_MODE,
                payload: 'Standard',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                mode: 'Standard',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_LANGUAGE, () => {
        it('should set language to payload', () => {
            const initialState = {
                language: 'English (International)',
            };

            const action = {
                type: ActionTypes.SET_LANGUAGE,
                payload: 'Urdu',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                language: 'Urdu',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.CURRENCY_DATA_FETCH_SUCCESS, () => {
        it('should set currency to action.payload.currency', () => {
            const initialState = {
                currency: 'USD',
            };

            const action = {
                type: ActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
                payload: {
                    currency: 'EUR',
                    availableCurrencies: [],
                },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                currency: 'EUR',
            };

            expect(newState.currency).to.eql(expectedState.currency);
        });

        it('should set conversionRate action.payload.conversionRate', () => {
            const initialState = {
                conversionRate: 1,
            };

            const action = {
                type: ActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
                payload: {
                    conversionRate: 2,
                    availableCurrencies: [],
                },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                conversionRate: 2,
            };

            expect(newState.conversionRate).to.eql(expectedState.conversionRate);
        });
    });

    describe(ActionTypes.UPDATE_THEME, () => {
        it('should set themeName to payload', () => {
            const initialState = {
                themeName: 'Default',
            };

            const action = {
                type: ActionTypes.UPDATE_THEME,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                themeName: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_RANDOMLY_SELECTED_NODE, () => {
        it('should set node to payload', () => {
            const initialState = {
                node: 'http://localhost:9000',
            };

            const action = {
                type: ActionTypes.SET_RANDOMLY_SELECTED_NODE,
                payload: 'http://localhost:5000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                node: 'http://localhost:5000',
            };

            expect(newState.node).to.eql(expectedState.node);
        });

        it('should set hasRandomizedNode to true', () => {
            const initialState = {
                hasRandomizedNode: false,
            };

            const action = {
                type: ActionTypes.SET_RANDOMLY_SELECTED_NODE,
                payload: 'http://localhost:5000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hasRandomizedNode: true,
            };

            expect(newState.hasRandomizedNode).to.eql(expectedState.hasRandomizedNode);
        });
    });

    describe(ActionTypes.SET_FINGERPRINT_STATUS, () => {
        it('should set isFingerprintEnabled to payload', () => {
            const initialState = {
                isFingerprintEnabled: false,
            };

            const action = {
                type: ActionTypes.SET_FINGERPRINT_STATUS,
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFingerprintEnabled: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_VERSIONS, () => {
        it('should merge payload in "versions" state prop', () => {
            const initialState = {
                versions: {},
            };

            const action = {
                type: ActionTypes.SET_VERSIONS,
                payload: { build: '3.4.4' },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                versions: { build: '3.4.4' },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.ACCEPT_TERMS, () => {
        it('should set acceptedTerms to true', () => {
            const initialState = {
                acceptedTerms: false,
            };

            const action = {
                type: ActionTypes.ACCEPT_TERMS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                acceptedTerms: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.ACCEPT_PRIVACY, () => {
        it('should set acceptedPrivacy to true', () => {
            const initialState = {
                acceptedPrivacy: false,
            };

            const action = {
                type: ActionTypes.ACCEPT_PRIVACY,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                acceptedPrivacy: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_DEEP_LINKING, () => {
        it('should set deepLinking to true', () => {
            const initialState = {
                deepLinking: false,
            };

            const action = {
                type: ActionTypes.SET_DEEP_LINKING,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                deepLinking: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.TOGGLE_EMPTY_TRANSACTIONS, () => {
        it('should invert state.hideEmptyTransactions', () => {
            const initialState = {
                hideEmptyTransactions: false,
            };

            const action = {
                type: ActionTypes.TOGGLE_EMPTY_TRANSACTIONS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hideEmptyTransactions: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE, () => {
        it('should set completedForcedPasswordUpdate to true', () => {
            const initialState = {
                completedForcedPasswordUpdate: false,
            };

            const action = {
                type: ActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                completedForcedPasswordUpdate: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_BYTETRIT_STATUS, () => {
        it('should set completedByteTritSweep to action.payload', () => {
            const initialState = {
                completedByteTritSweep: false,
            };

            const action = {
                type: ActionTypes.SET_BYTETRIT_STATUS,
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                completedByteTritSweep: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_TRAY, () => {
        it('should set isTrayEnabled to payload', () => {
            const initialState = {
                isTrayEnabled: true,
            };

            const action = {
                type: ActionTypes.SET_TRAY,
                payload: false,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isTrayEnabled: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(ActionTypes.SET_NOTIFICATIONS, () => {
        it('should set notifications.general to payload', () => {
            const initialState = {
                notifications: {
                    general: true,
                    confirmations: true,
                    messages: true,
                },
            };

            const action = {
                type: ActionTypes.SET_NOTIFICATIONS,
                payload: { type: 'general', enabled: false },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                notifications: {
                    general: false,
                    confirmations: true,
                    messages: true,
                },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_PROXY', () => {
        it('should set ignoreProxy to payload', () => {
            const initialState = {
                ignoreProxy: false,
            };

            const action = {
                type: ActionTypes.SET_PROXY,
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                ignoreProxy: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/SETTINGS/RESET_NODES_LIST', () => {
        it('should set nodes to an empty array', () => {
            const initialState = {
                nodes: ['http://localhost:14264', 'http://localhost:14265'],
            };

            const action = {
                type: ActionTypes.RESET_NODES_LIST,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                nodes: [],
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
