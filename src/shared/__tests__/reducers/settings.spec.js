import { expect } from 'chai';
import reducer from '../../reducers/settings';
import * as actions from '../../actions/settings';
import { defaultNode, nodes } from '../../config';
import themes from '../../themes/themes';

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
                theme: themes.Default,
                hasRandomizedNode: false,
                remotePoW: false,
                lockScreenTimeout: 3,
                versions: {},
                is2FAEnabled: false,
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
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('SET_LOCK_SCREEN_TIMEOUT', () => {
        it('should set lockScreenTimeout to payload', () => {
            const initialState = {
                lockScreenTimeout: 0,
            };

            const action = actions.setLockScreenTimeout(100);

            const newState = reducer(initialState, action);
            const expectedState = {
                lockScreenTimeout: 100,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_LOCALE', () => {
        it('should set locale to payload', () => {
            const initialState = {
                locale: 'en',
            };

            const action = {
                type: 'IOTA/SETTINGS/LOCALE',
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                locale: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_FULLNODE', () => {
        it('should set node to payload', () => {
            const initialState = {
                node: 'http://localhost:9000',
            };

            const action = actions.setNode('http://localhost:8000');

            const newState = reducer(initialState, action);
            const expectedState = {
                node: 'http://localhost:8000',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/SETTINGS/ADD_CUSTOM_NODE_SUCCESS', () => {
        describe('when payload exists in "nodes" state prop', () => {
            it('should return existing state prop "nodes"', () => {
                const initialState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000'],
                    customNodes: [],
                };

                const action = {
                    type: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_SUCCESS',
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
                    type: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_SUCCESS',
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

    describe('IOTA/SETTINGS/REMOVE_CUSTOM_NODE', () => {
        describe('when payload exists in "customNodes" state prop', () => {
            it('should remove payload from state prop "customNodes"', () => {
                const initialState = {
                    nodes: ['http://localhost:9000', 'http://localhost:5000'],
                    customNodes: ['http://localhost:5000'],
                };

                const action = {
                    type: 'IOTA/SETTINGS/REMOVE_CUSTOM_NODE',
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
                    type: 'IOTA/SETTINGS/REMOVE_CUSTOM_NODE',
                    payload: 'http://localhost:5000',
                };

                const newState = reducer(initialState, action);

                expect(newState.nodes).to.eql(initialState.nodes);
                expect(newState.customNodes).to.eql(initialState.customNodes);
            });
        });
    });

    describe('SET_MODE', () => {
        it('should set mode to payload', () => {
            const initialState = {
                mode: 'Expert',
            };

            const action = actions.setMode('Standard');

            const newState = reducer(initialState, action);
            const expectedState = {
                mode: 'Standard',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_LANGUAGE', () => {
        it('should set language to payload', () => {
            const initialState = {
                language: 'English (International)',
            };

            const action = actions.setLanguage('Urdu');

            const newState = reducer(initialState, action);
            const expectedState = {
                language: 'Urdu',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('CURRENCY_DATA_FETCH_SUCCESS', () => {
        it('should set currency to currency in payload', () => {
            const initialState = {
                currency: 'USD',
            };

            const action = actions.currencyDataFetchSuccess({ currency: 'EUR', availableCurrencies: [] });

            const newState = reducer(initialState, action);
            const expectedState = {
                currency: 'EUR',
            };

            expect(newState.currency).to.eql(expectedState.currency);
        });

        it('should set conversionRate to conversionRate in payload', () => {
            const initialState = {
                conversionRate: 1,
            };

            const action = actions.currencyDataFetchSuccess({ conversionRate: 2, availableCurrencies: [] });

            const newState = reducer(initialState, action);
            const expectedState = {
                conversionRate: 2,
            };

            expect(newState.conversionRate).to.eql(expectedState.conversionRate);
        });
    });

    describe('SET_RANDOMLY_SELECTED_NODE', () => {
        it('should set node to payload', () => {
            const initialState = {
                node: 'http://localhost:9000',
            };

            const action = actions.setRandomlySelectedNode('http://localhost:5000');

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

            const action = actions.setRandomlySelectedNode();

            const newState = reducer(initialState, action);
            const expectedState = {
                hasRandomizedNode: true,
            };

            expect(newState.hasRandomizedNode).to.eql(expectedState.hasRandomizedNode);
        });
    });

    describe('SET_2FA_STATUS', () => {
        it('should set is2FAEnabled to payload', () => {
            const initialState = {
                is2FAEnabled: false,
            };

            const action = actions.set2FAStatus(true);

            const newState = reducer(initialState, action);
            const expectedState = {
                is2FAEnabled: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_FINGERPRINT_STATUS', () => {
        it('should set isFingerprintEnabled to payload', () => {
            const initialState = {
                isFingerprintEnabled: false,
            };

            const action = actions.setFingerprintStatus(true);

            const newState = reducer(initialState, action);
            const expectedState = {
                isFingerprintEnabled: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_VERSIONS', () => {
        it('should merge payload in "versions" state prop', () => {
            const initialState = {
                versions: {},
            };

            const action = actions.setAppVersions({ build: '3.4.4' });

            const newState = reducer(initialState, action);
            const expectedState = {
                versions: { build: '3.4.4' },
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_TRAY', () => {
        it('should set isTrayEnabled to payload', () => {
            const initialState = {
                isTrayEnabled: true,
            };

            const action = actions.setTray(false);

            const newState = reducer(initialState, action);
            const expectedState = {
                isTrayEnabled: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('SET_NOTIFICATIONS', () => {
        it('should set notifications.general to payload', () => {
            const initialState = {
                notifications: {
                    general: true,
                    confirmations: true,
                    messages: true,
                },
            };

            const action = actions.setNotifications({ type: 'general', enabled: false });

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
});
