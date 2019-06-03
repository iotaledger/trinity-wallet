import { initialState as settingsState } from 'reducers/settings';

/**
 * Update state object schema
 * @param {object} input - Schema object to update
 * @returns {object} - Update schema object
 */
const updateSchema = (input) => {
    const state = Object.assign({}, input);

    /**
     * 0.6.0
     */
    if (typeof state.settings.quorum !== 'object') {
        state.settings.quorum = Object.assign({}, settingsState.quorum);
        state.settings.autoNodeList = settingsState.autoNodeList;
        state.settings.nodeAutoSwitch = settingsState.nodeAutoSwitch;
    }

    return state;
};

export default updateSchema;
