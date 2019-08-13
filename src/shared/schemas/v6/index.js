import merge from 'lodash/merge';
import map from 'lodash/map';
import v5Schema from '../v5';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 5);

    // Bump wallet version.
    walletData.version = 6;
};

export default map(v5Schema, (schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                /*
                 * Determines if proof of work should be offloaded to a specific node
                 */
                powNode: {
                    type: 'string',
                    default: null,
                },
                /*
                 * Determines if the node for proof of work should be automatically selected
                 */
                powNodeAutoSwitch: {
                    type: 'bool',
                    default: true,
                },
            },
        });
    }

    return schema;
});

export { migration };
