import merge from 'lodash/merge';
import map from 'lodash/map';
import defaultSchemas from '../default';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 1);

    // Bump wallet version.
    walletData.version = 2;
};

export default map(defaultSchemas, (schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                /**
                 * Determines if deep linking is enabled
                 */
                deepLinking: {
                    type: 'bool',
                    default: false,
                },
            },
        });
    }

    return schema;
});

export { migration };
