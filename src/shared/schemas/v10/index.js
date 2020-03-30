import map from 'lodash/map';
import each from 'lodash/each';
import merge from 'lodash/merge';
import v9Schema from '../v9';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 9);
    const newWalletSettings = newRealm.objects('WalletSettings');

    // Bump wallet version.
    walletData.version = 10;
    each(newWalletSettings, (settings) => {
        settings.hideEmptyTransactions = true;
    });
};

export default map(v9Schema, (schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                hideEmptyTransactions: {
                    type: 'bool',
                    default: true,
                },
            },
        });
    }

    return schema;
});

export { migration };
