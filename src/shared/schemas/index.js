/* global Electron */
import cloneDeep from 'lodash/cloneDeep';
import includes from 'lodash/includes';
import unset from 'lodash/unset';
import xor from 'lodash/xor';
import v0Schema from './v0';
import v1Schema, { migration as v1Migration } from './v1';
import v2Schema, { migration as v2Migration } from './v2';
import v3Schema, { migration as v3Migration } from './v3';
import v4Schema, { migration as v4Migration } from './v4';
import v5Schema, { migration as v5Migration } from './v5';
import v6Schema, { migration as v6Migration } from './v6';
import v7Schema, { migration as v7Migration } from './v7';
import v8Schema, { migration as v8Migration } from './v8';
import v9Schema, { migration as v9Migration } from './v9';
import { __MOBILE__, __TEST__, __DEV__ } from '../config';
import { initialState as reduxSettingsState } from '../reducers/settings';
import { initialState as reduxAccountsState } from '../reducers/accounts';

/**
 * Get desktop Realm path based on the environment
 */
const getDesktopPath = () => {
    const path = `${typeof Electron === 'object' ? Electron.getUserDataPath() : ''}/trinity`;
    const suffixRC =
        typeof Electron === 'object' &&
        Electron.getVersion()
            .toLowerCase()
            .indexOf('rc') > 0
            ? '-rc'
            : '';
    const suffixDEV = __DEV__ ? '-dev' : '';

    return `${path}${suffixDEV}${suffixRC}.realm`;
};

const STORAGE_PATH = __MOBILE__ || __TEST__ ? 'trinity.realm' : getDesktopPath();

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
    const state = cloneDeep(input);

    const latestReduxSettingsKeys = Object.keys(reduxSettingsState);
    const oldReduxSettingsKeys = Object.keys(state.settings);

    const latestReduxAccountsKeys = Object.keys(reduxAccountsState);
    const oldReduxAccountsKeys = Object.keys(state.accounts);

    // Find a difference of the properties between of old state and new state
    const newSettingsKeys = xor(latestReduxSettingsKeys, oldReduxSettingsKeys);
    const newAccountsKeys = xor(latestReduxAccountsKeys, oldReduxAccountsKeys);

    newSettingsKeys.forEach((key) => {
        // If property is new, then assign it to the state.settings object
        if (includes(latestReduxSettingsKeys, key) && !includes(oldReduxSettingsKeys, key)) {
            state.settings[key] = reduxSettingsState[key];
        }

        // If the property is old (and not present in the latest state.settings object), remove it
        if (includes(oldReduxSettingsKeys, key) && !includes(latestReduxSettingsKeys, key)) {
            unset(state.settings, key);
        }
    });

    newAccountsKeys.forEach((key) => {
        // If property is new, then assign it to the state.accounts object
        if (includes(latestReduxAccountsKeys, key) && !includes(oldReduxAccountsKeys, key)) {
            state.accounts[key] = reduxAccountsState[key];
        }

        // If the property is old (and not present in the latest state.accounts object), remove it
        if (includes(oldReduxAccountsKeys, key) && !includes(latestReduxAccountsKeys, key)) {
            unset(state.accounts, key);
        }
    });

    const convertToNodeObject = (node) => {
        /**
         * Windows 7 release <= 1.0.0 was converting nodes  that are already converted which resulted in node.url containing the node object itself, this hotfix check reverses that
         */
        if (typeof node === 'object') {
            if (typeof node.url === 'object') {
                return node.url;
            }
            return node;
        }

        return {
            url: node,
            pow: false,
            token: '',
            password: '',
        };
    };

    // Types of state.settings.node, state.settings.nodes and state.settings.customNodes are changed in the latest redux schema
    // Previously, they were stored as strings e.g., state.settings.node: <string>, state.settings.node: <string>[]
    // But in the latest redux schema, they are stored as an object with properties (url, pow, token, password)
    state.settings.customNodes.forEach(convertToNodeObject);
    state.settings.nodes.forEach(convertToNodeObject);

    state.settings.node = convertToNodeObject(state.settings.node);

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
    {
        schema: v6Schema,
        schemaVersion: 6,
        path: STORAGE_PATH,
        migration: v6Migration,
    },
    {
        schema: v7Schema,
        schemaVersion: 7,
        path: STORAGE_PATH,
        migration: v7Migration,
    },
    {
        schema: v8Schema,
        schemaVersion: 8,
        path: STORAGE_PATH,
        migration: v8Migration,
    },
    {
        schema: v9Schema,
        schemaVersion: 9,
        path: STORAGE_PATH,
        migration: v9Migration,
    },
];

export { v0Schema, v1Schema, STORAGE_PATH, getDeprecatedStoragePath };
