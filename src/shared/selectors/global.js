import assign from 'lodash/assign';
import has from 'lodash/has';
import filter from 'lodash/filter';
import find from 'lodash/find';
import findKey from 'lodash/findKey';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import sample from 'lodash/sample';
import { createSelector } from 'reselect';
import Themes from '../themes/themes';
import { DEFAULT_NODE } from '../config';

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
    const {
        isTransitioning,
        isSendingTransfer,
        isGeneratingReceiveAddress,
        isSyncing,
        isRetryingFailedTransaction,
    } = uiState;

    const { isFetchingAccountInfo } = pollingState;

    return (
        isSyncing ||
        isSendingTransfer ||
        isGeneratingReceiveAddress ||
        isTransitioning ||
        isFetchingAccountInfo ||
        isRetryingFailedTransaction
    );
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
 *
 *   @param {object} state
 *
 *   @returns {array}
 **/
export const getNodesFromState = createSelector(getSettingsFromState, (state) => state.nodes || []);

/**
 *   Selects selected IRI node prop from settings reducer state object.
 *   Uses getSettingsFromState selector for slicing settings state from the whole state object.
 *
 *   @method getSelectedNodeFromState
 *
 *   @param {object} state
 *
 *   @returns {object}
 **/
export const getSelectedNodeFromState = createSelector(getSettingsFromState, (state) => state.node || DEFAULT_NODE);

/**
 *   Selects random pow node prop from settings reducer state object.
 *   Uses getSettingsFromState selector for slicing settings state from the whole state object.
 *
 *   @method getRandomPowNodeFromState
 *
 *   @param {object} state
 *
 *   @returns {object}
 **/
export const getRandomPowNodeFromState = createSelector(getSettingsFromState, (state) =>
    get(sample(filter([...state.customNodes, ...state.nodes], (node) => node.pow === true)), 'url'),
);

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
 *
 *   @param {object} state
 *
 *   @returns {array}
 **/
export const getCustomNodesFromState = createSelector(getSettingsFromState, (state) => state.customNodes || []);

/**
 * Gets configuration for node manager from state.
 *
 * @method nodesConfigurationFactory
 *
 * @param {object} overrides
 *
 * @returns {object}
 **/
export const nodesConfigurationFactory = (overrides) =>
    createSelector(getSettingsFromState, (state) => {
        const config = {
            /** Node that should be given priority while connecting. */
            priorityNode: DEFAULT_NODE,
            /**
             * Wallet nodes
             * autoNodeList (true) -> choose random nodes from all nodes for auto-retrying
             * autoNodeList(false) -> choose random nodes from only custom nodes for auto-retrying
             */
            nodes: state.autoNodeList ? [...state.nodes, ...state.customNodes] : state.customNodes,
            /** Wallet's active node */
            primaryNode: state.node,
            /** Wallet's active PoW node - undefined if not performing remote PoW */
            powNode: undefined,
            /** Determines if quorum is enabled/disabled */
            quorum: state.quorum,
            /**
             * Determines if (primary) node should automatically be auto-switched
             */
            nodeAutoSwitch: state.nodeAutoSwitch,
            /**
             * Determines if (PoW) node should automatically be auto-switched
             */
            powNodeAutoSwitch: state.powNodeAutoSwitch,
            /**
             * - When true: pull in nodes from endpoint (config#NODELIST_URL) and include the custom nodes in the quorum selection
             * - When false: only use custom nodes in quorum selection
             */
            autoNodeList: state.autoNodeList,
        };

        const shouldOverrideQuorumConfig = has(overrides, 'quorum');
        const shouldUseOnlyPowNodes = has(overrides, 'useOnlyPowNodes');

        if (
            shouldOverrideQuorumConfig &&
            // Only allow quorum override if user has explicitly turned on quorum (or if it is turned off as default)
            // If a user has disabled quorum, then no quorum should be executed at any place in the application
            config.quorum.enabled === true
        ) {
            config.quorum = assign({}, config.quorum, { enabled: overrides.quorum });
        }

        if (shouldUseOnlyPowNodes) {
            config.nodes = filter(config.nodes, (node) => node.pow === true);
            config.powNode = find(config.nodes, (node) => node.url === state.powNode);
        }

        return config;
    });

/**
 * Selects sweepsStatuses from state.wallet
 *
 * @method getSweepsStatusesFromState
 *
 * @param {object} state
 *
 * @returns {object}
 **/
export const getSweepsStatusesFromState = createSelector(getWalletFromState, (state) => state.sweepsStatuses);

/**
 * Selects active sweep status address
 *
 * @method getActiveSweepStatusObject
 *
 * @param {object} state
 *
 * @returns {string}
 **/
export const getActiveSweepAddress = createSelector(getSweepsStatusesFromState, (statuses) =>
    isEmpty(statuses) ? '' : findKey(statuses, (status) => status.active === true),
);

/**
 * Selects active sweep status address
 *
 * @method getActiveSweepStatusObject
 *
 * @param {object} state
 *
 * @returns {string}
 **/
export const getActiveSweepInitialisationTime = createSelector(getSweepsStatusesFromState, (statuses) =>
    isEmpty(statuses)
        ? -1
        : get(
              find(statuses, (status) => status.active === true),
              'initialisationTime',
          ),
);
