import each from 'lodash/each';
import merge from 'lodash/merge';
import map from 'lodash/map';
import v2Schema from '../v2';
import { QUORUM_SIZE } from '../../config';

const migration = (oldRealm, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 2);
    const newWalletSettings = newRealm.objects('WalletSettings');

    // Bump wallet version.
    walletData.version = 3;

    each(newWalletSettings, (settings) => {
        settings.quorum = {
            enabled: true,
            size: QUORUM_SIZE,
        };
        settings.autoNodeList = true;
        settings.nodeAutoSwitch = true;
    });
};

/**
 * Schema for quorum config
 */
export const QuorumConfigSchema = {
    name: 'QuorumConfig',
    properties: {
        size: {
            type: 'int',
            default: QUORUM_SIZE,
        },
        enabled: {
            type: 'bool',
            default: true,
        },
    },
};

export default [
    QuorumConfigSchema,
    ...map(v2Schema, (schema) => {
        if (schema.name === 'Node') {
            return merge({}, schema, {
                properties: {
                    /**
                     * (Optional) authentication token (username) for node
                     */
                    token: {
                        type: 'string',
                        default: '',
                    },
                    /**
                     * (Optional) password for node
                     */
                    password: {
                        type: 'string',
                        default: '',
                    },
                },
            });
        } else if (schema.name === 'WalletSettings') {
            return merge({}, schema, {
                properties: {
                    /**
                     * Quorum configuration
                     */
                    quorum: 'QuorumConfig',
                    /**
                     * Determines if (primary) node should automatically be auto-switched
                     */
                    autoNodeList: {
                        type: 'bool',
                        default: true,
                    },
                    /**
                     * - When true: pull in nodes from endpoint (config#NODELIST_URL) and include the custom nodes in the quorum selection
                     * - When false: only use custom nodes in quorum selection
                     */
                    nodeAutoSwitch: {
                        type: 'bool',
                        default: true,
                    },
                },
            });
        }

        return schema;
    }),
];

export { migration };
