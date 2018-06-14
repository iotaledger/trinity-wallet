import { expect } from 'chai';
import reducer from '../../reducers/settings';
import * as actions from '../../actions/settings';
import { DESKTOP_VERSION, defaultNode, nodes } from '../../config';
import themes from '../../themes/themes';

describe('Reducer: settings', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                locale: 'en',
                node: defaultNode,
                nodes,
                customNodes: [],
                mode: 'Standard',
                language: 'English (International)',
                currency: 'USD',
                autoNodeSwitching: true,
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
                update: {
                    done: true,
                    error: false,
                    version: DESKTOP_VERSION,
                    notes: [],
                },
                remotePoW: false,
                lockScreenTimeout: 3,
                versions: {},
                is2FAEnabled: false,
                isFingerprintEnabled: false,
                hasVisitedSeedShareTutorial: false,
                acceptedTerms: false,
                acceptedPrivacy: false,
                autoPromotion: true,
                hideEmptyTransactions: false,
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

    describe('SET_UPDATE_ERROR', () => {
        it('should set "done" prop in "update" to false if "force" prop is true in payload', () => {
            const initialState = {
                update: {
                    done: true,
                    error: false,
                    version: '0.1',
                    notes: [],
                },
            };

            const action = {
                type: 'IOTA/SETTINGS/SET_UPDATE_ERROR',
                payload: {
                    force: true,
                },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                update: {
                    done: false,
                    error: false,
                    version: '0.1',
                    notes: [],
                },
            };

            expect(newState.update.done).to.eql(expectedState.update.done);
        });

        it('should set "error" prop in "update" to true', () => {
            const initialState = {
                update: {
                    done: true,
                    error: false,
                    version: '0.1',
                    notes: [],
                },
            };

            const action = {
                type: 'IOTA/SETTINGS/SET_UPDATE_ERROR',
                payload: {},
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                update: {
                    done: true,
                    error: true,
                    version: '0.1',
                    notes: [],
                },
            };

            expect(newState.update.error).to.eql(expectedState.update.error);
        });
    });

    describe('SET_UPDATE_SUCCESS', () => {
        describe('when "version" is payload is equal to "version" in "update" state prop', () => {
            it('should set "done" prop in "update" to false if "force" prop is true in payload', () => {
                const initialState = {
                    update: {
                        done: true,
                        error: false,
                        version: '0.1',
                        notes: [],
                    },
                };

                const action = {
                    type: 'IOTA/SETTINGS/UPDATE_SUCCESS',
                    payload: {
                        force: true,
                        version: '0.1',
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    update: {
                        done: false,
                        error: false,
                        version: '0.1',
                        notes: [],
                    },
                };

                expect(newState.update.done).to.eql(expectedState.update.done);
            });
        });

        describe('when "version" is payload is not equal to "version" in "update" state prop', () => {
            it('should set "done" prop in "update" to false if "force" prop is false in payload', () => {
                const initialState = {
                    update: {
                        done: true,
                        error: false,
                        version: '0.1',
                        notes: [],
                    },
                };

                const action = {
                    type: 'IOTA/SETTINGS/UPDATE_SUCCESS',
                    payload: {
                        force: false,
                        version: '0.2',
                    },
                };

                const newState = reducer(initialState, action);
                const expectedState = {
                    update: {
                        done: false,
                        error: false,
                        version: '0.2',
                        notes: [],
                    },
                };

                expect(newState.update.done).to.eql(expectedState.update.done);
            });
        });

        it('should set "error" prop in "update" to false', () => {
            const initialState = {
                update: {
                    done: true,
                    error: true,
                    version: '0.1',
                    notes: [],
                },
            };

            const action = {
                type: 'IOTA/SETTINGS/UPDATE_SUCCESS',
                payload: {},
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                update: {
                    done: true,
                    error: false,
                    version: '0.1',
                    notes: [],
                },
            };

            expect(newState.update.error).to.eql(expectedState.update.error);
        });

        it('should set "version" prop in "update" to "version" prop in payload', () => {
            const initialState = {
                update: {
                    done: true,
                    error: true,
                    version: '0.1',
                    notes: [],
                },
            };

            const action = {
                type: 'IOTA/SETTINGS/UPDATE_SUCCESS',
                payload: {
                    version: '0.3',
                },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                update: {
                    done: true,
                    error: false,
                    version: '0.3',
                    notes: [],
                },
            };

            expect(newState.update.version).to.eql(expectedState.update.version);
        });

        it('should set "notes" prop in "update" to "notes" prop in payload', () => {
            const initialState = {
                update: {
                    done: true,
                    error: true,
                    version: '0.1',
                    notes: [],
                },
            };

            const action = {
                type: 'IOTA/SETTINGS/UPDATE_SUCCESS',
                payload: {
                    notes: [{}, {}],
                },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                update: {
                    done: true,
                    error: false,
                    version: '0.1',
                    notes: [{}, {}],
                },
            };

            expect(newState.update.notes).to.eql(expectedState.update.notes);
        });
    });

    describe('SET_UPDATE_SUCCESS', () => {
        it('should set "done" prop in "update" to true', () => {
            const initialState = {
                update: {
                    done: false,
                    error: true,
                    version: '0.1',
                    notes: [],
                },
            };

            const action = {
                type: 'IOTA/SETTINGS/UPDATE_DONE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                update: {
                    done: true,
                    error: false,
                    version: '0.1',
                    notes: [],
                },
            };

            expect(newState.update.done).to.eql(expectedState.update.done);
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

    describe('SET_SEED_SHARE_TUTORIAL_VISITATION_STATUS', () => {
        it('should set hasVisitedSeedShareTutorial to payload', () => {
            const initialState = {
                hasVisitedSeedShareTutorial: false,
            };

            const action = actions.setSeedShareTutorialVisitationStatus(true);

            const newState = reducer(initialState, action);
            const expectedState = {
                hasVisitedSeedShareTutorial: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
