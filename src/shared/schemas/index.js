/* global Electron */
import v0Schema, { migration as v0Migration } from './v0';
import v1Schema, { migration as v1Migration } from './v1';
import { __MOBILE__, __TEST__, __DEV__ } from '../config';

const STORAGE_PATH =
    __MOBILE__ || __TEST__ ? 'trinity.realm' : `${Electron.getUserDataPath()}/trinity${__DEV__ ? '-dev' : ''}.realm`;

export default [
    {
        schema: v0Schema,
        schemaVersion: 0,
        migration: v0Migration,
        path: STORAGE_PATH,
    },
    {
        schema: v1Schema,
        schemaVersion: 1,
        migration: v1Migration,
        path: STORAGE_PATH,
    },
];
