/* global Electron */
import v0Schema from './v0';
import v1Schema, { migration as v1Migration } from './v1';
import v2Schema, { migration as v2Migration } from './v2';
import v3Schema, { migration as v3Migration } from './v3';
import v4Schema, { migration as v4Migration } from './v4';
import v5Schema, { migration as v5Migration } from './v5';
import { __MOBILE__, __TEST__, __DEV__ } from '../config';
import { initialState as reduxSettingsState } from '../reducers/settings';

const STORAGE_PATH =
    __MOBILE__ || __TEST__
        ? 'trinity.realm'
        : `${typeof Electron === 'object' ? Electron.getUserDataPath() : ''}/trinity${__DEV__ ? '-dev' : ''}.realm`;

/**
 * Gets deprecated realm storage path
 *
 * @method getDeprecatedStoragePath
 *
 * @param {number} schemaVersion
 *
 * @returns {string}
 */
const getDeprecatedStoragePath = (schemaVersion) =>
    __MOBILE__ || __TEST__
        ? `trinity-${schemaVersion}.realm`
        : `${Electron.getUserDataPath()}/trinity${__DEV__ ? '-dev' : ''}-${schemaVersion}.realm`;

/**
 * Updates (redux) state object schema to current wallet version
 *
 * @method updateSchema
 *
 * @param {object} input - target state object
 *
 * @returns {object} - updated state object
 */
export const updateSchema = (input) => {
    const state = Object.assign({}, input);

    /**
     * 0.6.0
     */
    if (typeof state.settings.quorum !== 'object') {
        state.settings.quorum = Object.assign({}, reduxSettingsState.quorum);
        state.settings.autoNodeList = reduxSettingsState.autoNodeList;
        state.settings.nodeAutoSwitch = reduxSettingsState.nodeAutoSwitch;
    }

    return state;
};

export default [
    {
        schema: v0Schema,
        schemaVersion: 0,
        path: STORAGE_PATH,
    },
    {
        schema: v1Schema,
        schemaVersion: 1,
        migration: v1Migration,
        path: STORAGE_PATH,
    },
    {
        schema: v2Schema,
        schemaVersion: 2,
        path: STORAGE_PATH,
        migration: v2Migration,
    },
    {
        schema: v3Schema,
        schemaVersion: 3,
        path: STORAGE_PATH,
        migration: v3Migration,
    },
    {
        schema: v4Schema,
        schemaVersion: 4,
        path: STORAGE_PATH,
        migration: v4Migration,
    },
    {
        schema: v5Schema,
        schemaVersion: 5,
        path: STORAGE_PATH,
        migration: v5Migration,
    },
];

export { v0Schema, v1Schema, STORAGE_PATH, getDeprecatedStoragePath };
