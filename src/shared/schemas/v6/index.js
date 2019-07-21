import merge from 'lodash/merge';
import map from 'lodash/map';
import v5Schema from '../v5';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 5);

    // Bump wallet version.
    walletData.version = 6;
};

export default map(v5Schema, (schema) => {
    if (schema.name === 'Node') {
        return merge({}, schema, {
            properties: {
                /*
                 * If true, all attachToTangle requests will be forwarded to this node
                 */
                alwaysUseForPow: {
                    type: 'bool',
                    default: false,
                },
            },
        });
    }

    return schema;
});

export { migration };
