import { createSelector } from 'reselect';

/**
 *   Selects ui prop from state.
 *
 *   @method getUiFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getUiFromState = (state) => state.ui || {};

/**
 *   Selects polling prop from state.
 *
 *   @method getPollingFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getPollingFromState = (state) => state.polling || {};

/**
 *   Selects account name for currently selected account.
 *
 *   @method getSelectedAccountName
 *   @param {object} state
 *   @returns {string}
 **/
export const shouldPreventAction = createSelector(getUiFromState, getPollingFromState, (uiState, pollingState) => {
    const { isTransitioning, isSendingTransfer, isGeneratingReceiveAddress, isSyncing } = uiState;

    const { isFetchingAccountInfo } = pollingState;

    return isSyncing || isSendingTransfer || isGeneratingReceiveAddress || isTransitioning || isFetchingAccountInfo;
});
