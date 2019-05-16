import merge from 'lodash/merge';
import map from 'lodash/map';
import v2Schema from '../v2';
import { QUORUM_SIZE, DEFAULT_NODE } from '../../config';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 2);

    // Bump wallet version.
    walletData.version = 3;
    walletData.settings.quorum = {};
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
                     * (Optional) authentication key for node
                     */
                    token: {
                        type: 'string',
                        default: '',
                    },
                },
            });
        } else if (schema.name === 'WalletSettings') {
            return merge({}, schema, {
                properties: {
                    node: {
                        type: 'Node',
                        default: DEFAULT_NODE,
                    },
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
