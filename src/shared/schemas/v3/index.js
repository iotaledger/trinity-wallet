import merge from 'lodash/merge';
import map from 'lodash/map';
import v2Schema from '../v2';
import { QUORUM_SIZE } from '../../config';

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
                    authKey: {
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
                },
            });
        }

        return schema;
    }),
];

export { migration };
