import map from 'lodash/map';
import merge from 'lodash/merge';
import v8Schema from '../v8';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 8);

    // Bump wallet version.
    walletData.version = 9;
};

export default map(v8Schema, (schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                /*
                 * Selected chart timeframe
                 */
                timeframe: {
                    type: 'string',
                    default: null,
                },
                /*
                 * Selected chart currency
                 */
                currency: {
                    type: 'string',
                    default: null,
                },
            },
        });
    }

    return schema;
});

export { migration };
