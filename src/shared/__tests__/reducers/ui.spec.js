import { expect } from 'chai';
import reducer from '../../reducers/ui';

describe('Reducer: ui', () => {
    describe('initial state', () => {
        it('should have an initial state', () => {
            const initialState = {
                isGeneratingReceiveAddress: false,
                isFetchingCurrencyData: false,
                hasErrorFetchingCurrencyData: false,
                isPromotingTransaction: false,
                isTransitioning: false,
                isAttachingToTangle: false,
                isFetchingAccountInfo: false,
                hasErrorFetchingAccountInfo: false,
                hasErrorFetchingFullAccountInfo: false,
                isSendingTransfer: false,
                isSyncing: false,
                inactive: false,
                minimised: false,
                sendAddressFieldText: '',
                sendAmountFieldText: '',
                sendMessageFieldText: '',
                sendDenomination: 'i',
                doNotMinimise: false,
                isModalActive: false,
                isCheckingCustomNode: false,
                isChangingNode: false,
                currentlyPromotingBundleHash: '',
                loginRoute: 'login',
                isRetryingFailedTransaction: false,
                qrAmount: '',
                qrDenomination: 'i',
                qrMessage: '',
                qrTag: '',
                selectedQrTab: 'message',
                modalContent: 'snapshotTransitionInfo',
                modalProps: {},
                currentRoute: 'login',
                hadErrorGeneratingNewAddress: false,
                isKeyboardActive: false,
                animateChartOnMount: true,
            };

            expect(reducer(undefined, {})).to.eql(initialState);
        });
    });

    describe('IOTA/SETTINGS/CURRENCY_DATA_FETCH_REQUEST', () => {
        it('should set "isFetchingCurrencyData" state prop to true', () => {
            const initialState = {
                isFetchingCurrencyData: false,
            };

            const action = {
                type: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingCurrencyData: true,
            };

            expect(newState.isFetchingCurrencyData).to.eql(expectedState.isFetchingCurrencyData);
        });

        it('should set "hasErrorFetchingCurrencyData" state prop to false', () => {
            const initialState = {
                hasErrorFetchingCurrencyData: true,
            };

            const action = {
                type: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hasErrorFetchingCurrencyData: false,
            };

            expect(newState.hasErrorFetchingCurrencyData).to.eql(expectedState.hasErrorFetchingCurrencyData);
        });
    });

    describe('IOTA/SETTINGS/CURRENCY_DATA_FETCH_SUCCESS', () => {
        it('should set "isFetchingCurrencyData" state prop to false', () => {
            const initialState = {
                isFetchingCurrencyData: true,
            };

            const action = {
                type: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingCurrencyData: false,
            };

            expect(newState.isFetchingCurrencyData).to.eql(expectedState.isFetchingCurrencyData);
        });
    });

    describe('IOTA/SETTINGS/CURRENCY_DATA_FETCH_ERROR', () => {
        it('should set "isFetchingCurrencyData" state prop to false', () => {
            const initialState = {
                isFetchingCurrencyData: true,
            };

            const action = {
                type: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingCurrencyData: false,
            };

            expect(newState.isFetchingCurrencyData).to.eql(expectedState.isFetchingCurrencyData);
        });

        it('should set "hasErrorFetchingCurrencyData" state prop to true', () => {
            const initialState = {
                hasErrorFetchingCurrencyData: false,
            };

            const action = {
                type: 'IOTA/SETTINGS/CURRENCY_DATA_FETCH_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hasErrorFetchingCurrencyData: true,
            };

            expect(newState.hasErrorFetchingCurrencyData).to.eql(expectedState.hasErrorFetchingCurrencyData);
        });
    });

    describe('IOTA/UI/SET_SEND_ADDRESS_FIELD', () => {
        it('should set "sendAddressFieldText" state prop to "payload"', () => {
            const initialState = {
                sendAddressFieldText: '',
            };

            const action = {
                type: 'IOTA/UI/SET_SEND_ADDRESS_FIELD',
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAddressFieldText: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/UI/SET_SEND_AMOUNT_FIELD', () => {
        it('should set "sendAmountFieldText" state prop to "payload"', () => {
            const initialState = {
                sendAmountFieldText: '',
            };

            const action = {
                type: 'IOTA/UI/SET_SEND_AMOUNT_FIELD',
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAmountFieldText: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/UI/SET_SEND_MESSAGE_FIELD', () => {
        it('should set "sendAddressFieldText" state prop to "payload"', () => {
            const initialState = {
                sendMessageFieldText: '',
            };

            const action = {
                type: 'IOTA/UI/SET_SEND_MESSAGE_FIELD',
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendMessageFieldText: 'foo',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/UI/CLEAR_SEND_FIELDS', () => {
        it('should set "sendAddressFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAddressFieldText: 'foo',
            };

            const action = {
                type: 'IOTA/UI/CLEAR_SEND_FIELDS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAddressFieldText: '',
            };

            expect(newState.sendAddressFieldText).to.eql(expectedState.sendAddressFieldText);
        });

        it('should set "sendAmountFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAmountFieldText: 'foo',
            };

            const action = {
                type: 'IOTA/UI/CLEAR_SEND_FIELDS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAmountFieldText: '',
            };

            expect(newState.sendAmountFieldText).to.eql(expectedState.sendAmountFieldText);
        });

        it('should set "sendMessageFieldText" state prop to an empty string', () => {
            const initialState = {
                sendMessageFieldText: 'foo',
            };

            const action = {
                type: 'IOTA/UI/CLEAR_SEND_FIELDS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendMessageFieldText: '',
            };

            expect(newState.sendMessageFieldText).to.eql(expectedState.sendMessageFieldText);
        });
    });

    describe('IOTA/APP/WALLET/SET_DEEP_LINK', () => {
        it('should set "sendAddressFieldText" state prop to "address" in action', () => {
            const initialState = {
                sendAddressFieldText: '',
            };

            const action = {
                type: 'IOTA/APP/WALLET/SET_DEEP_LINK',
                address: '9'.repeat(81),
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAddressFieldText: '9'.repeat(81),
            };

            expect(newState.sendAddressFieldText).to.eql(expectedState.sendAddressFieldText);
        });

        it('should set "sendAmountFieldText" state prop to "amount" in action', () => {
            const initialState = {
                sendAmountFieldText: '',
            };

            const action = {
                type: 'IOTA/APP/WALLET/SET_DEEP_LINK',
                amount: '100',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAmountFieldText: '100',
            };

            expect(newState.sendAmountFieldText).to.eql(expectedState.sendAmountFieldText);
        });

        it('should set "sendMessageFieldText" state prop to "message" in action', () => {
            const initialState = {
                sendMessageFieldText: '',
            };

            const action = {
                type: 'IOTA/APP/WALLET/SET_DEEP_LINK',
                message: 'YNWA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendMessageFieldText: 'YNWA',
            };

            expect(newState.sendMessageFieldText).to.eql(expectedState.sendMessageFieldText);
        });
    });

    describe('IOTA/UI/SET_SEND_DENOMINATION', () => {
        it('should set "sendDenomination" state prop to "payload" in action', () => {
            const initialState = {
                sendDenomination: 'i',
            };

            const action = {
                type: 'IOTA/UI/SET_SEND_DENOMINATION',
                payload: 'Mi',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendDenomination: 'Mi',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST', () => {
        it('should set "isPromotingTransaction" state prop to true', () => {
            const initialState = {
                isPromotingTransaction: false,
            };

            const action = {
                type: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isPromotingTransaction: true,
            };

            expect(newState.isPromotingTransaction).to.eql(expectedState.isPromotingTransaction);
        });

        it('should set "currentlyPromotingBundleHash" state prop to payload in action', () => {
            const initialState = {
                currentlyPromotingBundleHash: '',
            };

            const action = {
                type: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_REQUEST',
                payload: 'foo',
            };

            const newState = reducer(initialState, action);
            expect(newState.currentlyPromotingBundleHash).to.eql('foo');
        });
    });

    describe('IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS', () => {
        it('should set "isPromotingTransaction" state prop to false and "currentlyPromotingBundleHash" to empty strings', () => {
            const initialState = {
                isPromotingTransaction: true,
                currentlyPromotingBundleHash: 'foo',
            };

            const action = {
                type: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isPromotingTransaction: false,
                currentlyPromotingBundleHash: '',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR', () => {
        it('should set "isPromotingTransaction" state prop to true and "currentlyPromotingBundleHash" to empty strings', () => {
            const initialState = {
                isPromotingTransaction: true,
                currentlyPromotingBundleHash: 'foo',
            };

            const action = {
                type: 'IOTA/TRANSFERS/PROMOTE_TRANSACTION_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isPromotingTransaction: false,
                currentlyPromotingBundleHash: '',
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/UI/SET_USER_ACTIVITY', () => {
        it('should assign payload to state', () => {
            const initialState = {};

            const action = {
                type: 'IOTA/UI/SET_USER_ACTIVITY',
                payload: { foo: {} },
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                foo: {},
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/GENERATE_NEW_ADDRESS_REQUEST', () => {
        it('should set "isGeneratingReceiveAddress" state prop to true', () => {
            const initialState = {
                isGeneratingReceiveAddress: false,
                hadErrorGeneratingNewAddress: false,
            };

            const action = {
                type: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isGeneratingReceiveAddress: true,
                hadErrorGeneratingNewAddress: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/GENERATE_NEW_ADDRESS_SUCCESS', () => {
        it('should set "isGeneratingReceiveAddress" state prop to false', () => {
            const initialState = {
                isGeneratingReceiveAddress: true,
            };

            const action = {
                type: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isGeneratingReceiveAddress: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/GENERATE_NEW_ADDRESS_ERROR', () => {
        it('should set "isGeneratingReceiveAddress" state prop to true', () => {
            const initialState = {
                isGeneratingReceiveAddress: true,
                hadErrorGeneratingNewAddress: false,
            };

            const action = {
                type: 'IOTA/WALLET/GENERATE_NEW_ADDRESS_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isGeneratingReceiveAddress: false,
                hadErrorGeneratingNewAddress: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/SEND_TRANSFER_REQUEST', () => {
        it('should set "isSendingTransfer" state prop to true', () => {
            const initialState = {
                isSendingTransfer: false,
            };

            const action = {
                type: 'IOTA/TRANSFERS/SEND_TRANSFER_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/SEND_TRANSFER_SUCCESS', () => {
        it('should set "isSendingTransfer" state prop to false', () => {
            const initialState = {
                isSendingTransfer: true,
            };

            const action = {
                type: 'IOTA/TRANSFERS/SEND_TRANSFER_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/SEND_TRANSFER_ERROR', () => {
        it('should set "isSendingTransfer" state prop to true', () => {
            const initialState = {
                isSendingTransfer: true,
            };

            const action = {
                type: 'IOTA/TRANSFERS/SEND_TRANSFER_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/CLEAR_WALLET_DATA', () => {
        it('should set "isSendingTransfer" state prop to false', () => {
            const initialState = {
                isSendingTransfer: true,
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSendingTransfer: false,
            };

            expect(newState.isSendingTransfer).to.eql(expectedState.isSendingTransfer);
        });

        it('should set "sendDenomination" state prop to "i"', () => {
            const initialState = {
                sendDenomination: 'Mi',
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendDenomination: 'i',
            };

            expect(newState.sendDenomination).to.eql(expectedState.sendDenomination);
        });

        it('should set "sendAddressFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAddressFieldText: 'foo',
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAddressFieldText: '',
            };

            expect(newState.sendAddressFieldText).to.eql(expectedState.sendAddressFieldText);
        });

        it('should set "sendAmountFieldText" state prop to an empty string', () => {
            const initialState = {
                sendAmountFieldText: 'foo',
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendAmountFieldText: '',
            };

            expect(newState.sendAmountFieldText).to.eql(expectedState.sendAmountFieldText);
        });

        it('should set "sendMessageFieldText" state prop to an empty string', () => {
            const initialState = {
                sendMessageFieldText: 'foo',
            };

            const action = {
                type: 'IOTA/WALLET/CLEAR_WALLET_DATA',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                sendMessageFieldText: '',
            };

            expect(newState.sendMessageFieldText).to.eql(expectedState.sendMessageFieldText);
        });
    });

    describe('IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST', () => {
        it('should set "hasErrorFetchingAccountInfo" state prop to false', () => {
            const initialState = {
                hasErrorFetchingFullAccountInfo: true,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hasErrorFetchingFullAccountInfo: false,
                isFetchingAccountInfo: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_ERROR', () => {
        it('should set "hasErrorFetchingAccountInfo" state prop to true', () => {
            const initialState = {
                hasErrorFetchingFullAccountInfo: false,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/FULL_ACCOUNT_INFO_FETCH_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                hasErrorFetchingFullAccountInfo: true,
                isFetchingAccountInfo: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_REQUEST', () => {
        it('should set "isFetchingAccountInfo" state prop to true', () => {
            const initialState = {
                isFetchingAccountInfo: false,
                hasErrorFetchingAccountInfo: false,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingAccountInfo: true,
                hasErrorFetchingAccountInfo: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS', () => {
        it('should set "isFetchingAccountInfo" state prop to false', () => {
            const initialState = {
                isFetchingAccountInfo: true,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingAccountInfo: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR', () => {
        it('should set "isFetchingAccountInfo" state prop to true', () => {
            const initialState = {
                isFetchingAccountInfo: true,
                hasErrorFetchingAccountInfo: false,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/ACCOUNT_INFO_FETCH_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isFetchingAccountInfo: false,
                hasErrorFetchingAccountInfo: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/MANUAL_SYNC_REQUEST', () => {
        it('should set "isSyncing" state prop to true', () => {
            const initialState = {
                isSyncing: false,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/MANUAL_SYNC_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSyncing: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/MANUAL_SYNC_SUCCESS', () => {
        it('should set "isSyncing" state prop to false', () => {
            const initialState = {
                isSyncing: true,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/MANUAL_SYNC_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSyncing: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/ACCOUNTS/MANUAL_SYNC_ERROR', () => {
        it('should set "isSyncing" state prop to true', () => {
            const initialState = {
                isSyncing: true,
            };

            const action = {
                type: 'IOTA/ACCOUNTS/MANUAL_SYNC_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isSyncing: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/SNAPSHOT_TRANSITION_REQUEST', () => {
        it('should set "isTransitioning" state prop to true', () => {
            const initialState = {
                isTransitioning: false,
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_TRANSITION_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isTransitioning: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS', () => {
        it('should set "isTransitioning" state prop to false', () => {
            const initialState = {
                isTransitioning: true,
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_TRANSITION_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isTransitioning: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR', () => {
        it('should set "isTransitioning" state prop to true', () => {
            const initialState = {
                isTransitioning: true,
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_TRANSITION_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isTransitioning: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_REQUEST', () => {
        it('should set "isAttachingToTangle" state prop to true', () => {
            const initialState = {
                isAttachingToTangle: false,
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isAttachingToTangle: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE', () => {
        it('should set "isAttachingToTangle" state prop to false', () => {
            const initialState = {
                isAttachingToTangle: true,
            };

            const action = {
                type: 'IOTA/WALLET/SNAPSHOT_ATTACH_TO_TANGLE_COMPLETE',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isAttachingToTangle: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/UI/SET_DO_NOT_MINIMISE', () => {
        it('should set "doNotMinimise" state prop to true', () => {
            const initialState = {
                doNotMinimise: true,
            };

            const action = {
                type: 'IOTA/UI/SET_DO_NOT_MINIMISE',
                payload: true,
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                doNotMinimise: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/UI/TOGGLE_MODAL_ACTIVITY', () => {
        it('should set "isModalActive" state prop to true', () => {
            const initialState = {
                isModalActive: false,
                modalContent: 'snapshotTransitionInfo',
                modalProps: {},
            };

            const action = {
                type: 'IOTA/UI/TOGGLE_MODAL_ACTIVITY',
                modalContent: 'unitInfo',
                modalProps: {},
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isModalActive: true,
                modalContent: 'unitInfo',
                modalProps: {},
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/UI/TOGGLE_MODAL_ACTIVITY', () => {
        it('should set "isModalActive" state prop to false', () => {
            const initialState = {
                isModalActive: true,
                modalContent: 'snapshotTransitionInfo',
                modalProps: {},
            };

            const action = {
                type: 'IOTA/UI/TOGGLE_MODAL_ACTIVITY',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isModalActive: false,
                modalContent: 'snapshotTransitionInfo',
                modalProps: {},
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/SETTINGS/ADD_CUSTOM_NODE_REQUEST', () => {
        it('should set "isCheckingCustomNode" state prop to true', () => {
            const initialState = {
                isCheckingCustomNode: false,
            };

            const action = {
                type: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isCheckingCustomNode: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/SETTINGS/ADD_CUSTOM_NODE_SUCCESS', () => {
        it('should set "isCheckingCustomNode" to false', () => {
            const initialState = {
                isCheckingCustomNode: true,
            };

            const action = {
                type: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isCheckingCustomNode: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/SETTINGS/ADD_CUSTOM_NODE_ERROR', () => {
        it('should set "isCheckingCustomNode" state prop to false', () => {
            const initialState = {
                isCheckingCustomNode: false,
            };

            const action = {
                type: 'IOTA/SETTINGS/ADD_CUSTOM_NODE_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isCheckingCustomNode: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_REQUEST', () => {
        it('should set "isRetryingFailedTransaction" state prop to true', () => {
            const initialState = {
                isRetryingFailedTransaction: true,
            };

            const action = {
                type: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_REQUEST',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isRetryingFailedTransaction: true,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_SUCCESS', () => {
        it('should set "isRetryingFailedTransaction" state prop to false', () => {
            const initialState = {
                isRetryingFailedTransaction: true,
            };

            const action = {
                type: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_SUCCESS',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isRetryingFailedTransaction: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });

    describe('IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_ERROR', () => {
        it('should set "isRetryingFailedTransaction" state prop to false', () => {
            const initialState = {
                isRetryingFailedTransaction: true,
            };

            const action = {
                type: 'IOTA/TRANSFERS/RETRY_FAILED_TRANSACTION_ERROR',
            };

            const newState = reducer(initialState, action);
            const expectedState = {
                isRetryingFailedTransaction: false,
            };

            expect(newState).to.eql(expectedState);
        });
    });
});
