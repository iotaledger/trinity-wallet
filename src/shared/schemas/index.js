/* global Electron */
import v0Schema from './v0';
import v1Schema, { migration as v1Migration } from './v1';
import v2Schema, { migration as v2Migration } from './v2';
import { __MOBILE__, __TEST__, __DEV__ } from '../config';

const STORAGE_PATH =
    __MOBILE__ || __TEST__ ? 'trinity.realm' : `${Electron.getUserDataPath()}/trinity${__DEV__ ? '-dev' : ''}.realm`;

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
];

export { v0Schema, v1Schema, STORAGE_PATH, getDeprecatedStoragePath };
