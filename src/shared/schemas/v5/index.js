import merge from 'lodash/merge';
import map from 'lodash/map';
import v4Schema from '../v4';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 4);

    // Bump wallet version.
    walletData.version = 5;
};

export default map(v4Schema, (schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                /*
                 * Desktop: Use system proxy settings
                 */
                ignoreProxy: {
                    type: 'bool',
                    default: false,
                },
            },
        });
    }

    return schema;
});

export { migration };
