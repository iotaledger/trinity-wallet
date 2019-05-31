import { expect } from 'chai';
import reducer from '../../reducers/settings';
import { SettingsActionTypes } from '../../types';
import { DEFAULT_NODES, DEFAULT_NODE, QUORUM_SIZE } from '../../config';

describe('Reducer: settings', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                completedByteTritSweep: false,
                locale: 'en',
                node: DEFAULT_NODE,
                nodes: DEFAULT_NODES,
                customNodes: [],
                mode: 'Standard',
                language: 'English (International)',
                currency: 'USD',
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
                completedMigration: true,
                ignoreProxy: false,
                deepLinking: false,
                quorum: {
                    size: QUORUM_SIZE,
                    enabled: true,
                },
                nodeAutoSwitch: true,
                autoNodeList: true,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe(SettingsActionTypes.SET_LOCK_SCREEN_TIMEOUT, () => {
        it('should set lockScreenTimeout to payload', () => {
            const initialState = {
                lockScreenTimeout: 0,
            };

            const action = {
                type: SettingsActionTypes.SET_LOCK_SCREEN_TIMEOUT,
                payload: 100,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                lockScreenTimeout: 100,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_REMOTE_POW, () => {
        it('should update remotePoW in state', () => {
            const initialState = {
                remotePoW: false,
            };

            const action = {
                type: SettingsActionTypes.SET_REMOTE_POW,
                payload: true,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                remotePoW: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_AUTO_PROMOTION, () => {
        it('should update autoPromotion in state', () => {
            const initialState = {
                autoPromotion: false,
            };

            const action = {
                type: SettingsActionTypes.SET_AUTO_PROMOTION,
                payload: true,
            };

            const newState = reducer(initialState, action);

            const expectedState = {
                autoPromotion: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING, () => {
        describe('when action.payload is defined', () => {
            it('should set nodeAutoSwitch to action.payload', () => {
                const initialState = {
                    nodeAutoSwitch: false,
                };

                const action = {
                    type: SettingsActionTypes.UPDATE_NODE_AUTO_SWITCH_SETTING,
                    payload: true,
                };

                const newState = reducer(initialState, action);

                const expectedState = {
                    nodeAutoSwitch: true,
                };

                expect(newState).to.eql(expectedState);
            });
        });
    });

    describe(SettingsActionTypes.SET_LOCALE, () => {
        it('should set locale to payload', () => {
            const initialState = {
                locale: 'en',
            };

            const action = {
                type: SettingsActionTypes.SET_LOCALE,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                locale: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_NODE, () => {
        it('should set node to action.payload', () => {
            const initialState = {
                node: 'http://localhost:9000',
            };

            const action = {
                type: SettingsActionTypes.SET_NODE,
                payload: 'http://localhost:8000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                node: 'http://localhost:8000',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS, () => {
        describe('when payload.url exists in "customNodes" state prop', () => {
            it('should return existing state prop "customNodes"', () => {
                const initialState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                    ],
                };

                const action = {
                    type: SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS,
                    payload: {
                        url: 'http://localhost:9000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                    ],
                };

                expect(newState).to.eql(expectedState);
            });
        });

        describe('when payload.url does not exist in "customNodes" state prop', () => {
            it('should return concat payload to state prop "customNodes"', () => {
                const initialState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                    ],
                };

                const action = {
                    type: SettingsActionTypes.ADD_CUSTOM_NODE_SUCCESS,
                    payload: {
                        url: 'http://localhost:3000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    customNodes: [
                        {
                            url: 'http://localhost:9000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:5000',
                            pow: true,
                            token: '',
                            password: '',
                        },
                        {
                            url: 'http://localhost:3000',
                            pow: false,
                            token: '',
                            password: '',
                        },
                    ],
                };

                expect(newState.nodes).to.eql(expectedState.nodes);
            });
        });
    });

    describe(SettingsActionTypes.REMOVE_CUSTOM_NODE, () => {
        it('should remove node object in customNodes with "url === payload"', () => {
            const initialState = {
                customNodes: [
                    {
                        url: 'http://localhost:9000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                    {
                        url: 'http://localhost:5000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            const action = {
                type: SettingsActionTypes.REMOVE_CUSTOM_NODE,
                payload: 'http://localhost:5000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                customNodes: [
                    {
                        url: 'http://localhost:9000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_NODELIST, () => {
        it('should set nodes to action.payload', () => {
            const initialState = {
                nodes: [
                    {
                        url: 'http://localhost:4000',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            const action = {
                type: SettingsActionTypes.SET_NODELIST,
                payload: [
                    {
                        url: 'http://localhost:5000',
                        pow: true,
                        token: '',
                        password: '',
                    },
                    {
                        url: 'http://localhost:80',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                nodes: [
                    {
                        url: 'http://localhost:5000',
                        pow: true,
                        token: '',
                        password: '',
                    },
                    {
                        url: 'http://localhost:80',
                        pow: false,
                        token: '',
                        password: '',
                    },
                ],
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_MODE, () => {
        it('should set mode to payload', () => {
            const initialState = {
                mode: 'Expert',
            };

            const action = {
                type: SettingsActionTypes.SET_MODE,
                payload: 'Standard',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                mode: 'Standard',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_LANGUAGE, () => {
        it('should set language to payload', () => {
            const initialState = {
                language: 'English (International)',
            };

            const action = {
                type: SettingsActionTypes.SET_LANGUAGE,
                payload: 'Urdu',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                language: 'Urdu',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS, () => {
        it('should set currency to action.payload.currency', () => {
            const initialState = {
                currency: 'USD',
            };

            const action = {
                type: SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
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
                type: SettingsActionTypes.CURRENCY_DATA_FETCH_SUCCESS,
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

    describe(SettingsActionTypes.UPDATE_THEME, () => {
        it('should set themeName to payload', () => {
            const initialState = {
                themeName: 'Default',
            };

            const action = {
                type: SettingsActionTypes.UPDATE_THEME,
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                themeName: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_RANDOMLY_SELECTED_NODE, () => {
        it('should set node to payload', () => {
            const initialState = {
                node: 'http://localhost:9000',
            };

            const action = {
                type: SettingsActionTypes.SET_RANDOMLY_SELECTED_NODE,
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
                type: SettingsActionTypes.SET_RANDOMLY_SELECTED_NODE,
                payload: 'http://localhost:5000',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hasRandomizedNode: true,
            };

            expect(newState.hasRandomizedNode).to.eql(expectedState.hasRandomizedNode);
        });
    });

    describe(SettingsActionTypes.SET_FINGERPRINT_STATUS, () => {
        it('should set isFingerprintEnabled to payload', () => {
            const initialState = {
                isFingerprintEnabled: false,
            };

            const action = {
                type: SettingsActionTypes.SET_FINGERPRINT_STATUS,
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFingerprintEnabled: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_VERSIONS, () => {
        it('should merge payload in "versions" state prop', () => {
            const initialState = {
                versions: {},
            };

            const action = {
                type: SettingsActionTypes.SET_VERSIONS,
                payload: { build: '3.4.4' },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                versions: { build: '3.4.4' },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.ACCEPT_TERMS, () => {
        it('should set acceptedTerms to true', () => {
            const initialState = {
                acceptedTerms: false,
            };

            const action = {
                type: SettingsActionTypes.ACCEPT_TERMS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                acceptedTerms: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.ACCEPT_PRIVACY, () => {
        it('should set acceptedPrivacy to true', () => {
            const initialState = {
                acceptedPrivacy: false,
            };

            const action = {
                type: SettingsActionTypes.ACCEPT_PRIVACY,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                acceptedPrivacy: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_DEEP_LINKING, () => {
        it('should set deepLinking to true', () => {
            const initialState = {
                deepLinking: false,
            };

            const action = {
                type: SettingsActionTypes.SET_DEEP_LINKING,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                deepLinking: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.TOGGLE_EMPTY_TRANSACTIONS, () => {
        it('should invert state.hideEmptyTransactions', () => {
            const initialState = {
                hideEmptyTransactions: false,
            };

            const action = {
                type: SettingsActionTypes.TOGGLE_EMPTY_TRANSACTIONS,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hideEmptyTransactions: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE, () => {
        it('should set completedForcedPasswordUpdate to true', () => {
            const initialState = {
                completedForcedPasswordUpdate: false,
            };

            const action = {
                type: SettingsActionTypes.SET_COMPLETED_FORCED_PASSWORD_UPDATE,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                completedForcedPasswordUpdate: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_BYTETRIT_STATUS, () => {
        it('should set completedByteTritSweep to action.payload', () => {
            const initialState = {
                completedByteTritSweep: false,
            };

            const action = {
                type: SettingsActionTypes.SET_BYTETRIT_STATUS,
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                completedByteTritSweep: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_TRAY, () => {
        it('should set isTrayEnabled to payload', () => {
            const initialState = {
                isTrayEnabled: true,
            };

            const action = {
                type: SettingsActionTypes.SET_TRAY,
                payload: false,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isTrayEnabled: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe(SettingsActionTypes.SET_NOTIFICATIONS, () => {
        it('should set notifications.general to payload', () => {
            const initialState = {
                notifications: {
                    general: true,
                    confirmations: true,
                    messages: true,
                },
            };

            const action = {
                type: SettingsActionTypes.SET_NOTIFICATIONS,
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
                type: SettingsActionTypes.SET_PROXY,
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
                type: SettingsActionTypes.RESET_NODES_LIST,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                nodes: [],
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
