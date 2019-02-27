import { createSelector } from 'reselect';
import Themes from '../themes/themes';
import { defaultNode as DEFAULT_IRI_NODE } from '../config';

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
 *   Determines if certain actions should be prevented when any heavy polling service is active.
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

/**
 *   Selects settings prop from state.
 *
 *   @method getSettingsFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getSettingsFromState = (state) => state.settings || {};

/**
 *   Selects remotePoW prop from settings reducer state object.
 *   Uses getSettingsFromState selector for slicing settings state from the whole state object.
 *
 *   @method getRemotePoWFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getRemotePoWFromState = createSelector(getSettingsFromState, (state) => state.remotePoW);

/**
 *   Selects IRI nodes prop from settings reducer state object.
 *   Uses getSettingsFromState selector for slicing settings state from the whole state object.
 *
 *   @method getNodesFromState
 *   @param {object} state
 *   @returns {array}
 **/
export const getNodesFromState = createSelector(getSettingsFromState, (state) => state.nodes || []);

/**
 *   Selects selected IRI node prop from settings reducer state object.
 *   Uses getSettingsFromState selector for slicing settings state from the whole state object.
 *
 *   @method getSelectedNodeFromState
 *   @param {object} state
 *   @returns {array}
 **/
export const getSelectedNodeFromState = createSelector(getSettingsFromState, (state) => state.node || DEFAULT_IRI_NODE);

/**
 *   Selects wallet prop from state.
 *
 *   @method getWalletFromState
 *   @param {object} state
 *   @returns {object}
 **/
export const getWalletFromState = (state) => state.wallet || {};

/**
 *   Selects seedIndex prop from wallet reducer state object.
 *   Uses getWalletFromState selector for slicing wallet state from the whole state object.
 *
 *   @method getSeedIndexFromState
 *   @param {object} state
 *   @returns {number}
 **/
export const getSeedIndexFromState = createSelector(getWalletFromState, (state) => state.seedIndex || 0);

/**
 * Selects active theme name from state.settings
 */
export const getThemeNameFromState = createSelector(getSettingsFromState, (state) => state.themeName);

/**
 * Selects active theme object
 */
export const getThemeFromState = createSelector(
    getThemeNameFromState,
    (themeName) => Themes[themeName] || Themes.Default,
);

/**
 *   Selects custom nodes prop from settings reducer state object.
 *   Uses getSettingsFromState selector for slicing settings state from the whole state object.
 *
 *   @method getCustomNodesFromState
 *   @param {object} state
 *   @returns {array}
 **/
export const getCustomNodesFromState = createSelector(getSettingsFromState, (state) => state.customNodes || []);
