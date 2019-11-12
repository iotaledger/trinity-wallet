import omit from 'lodash/omit';
import map from 'lodash/map';
import v7Schema from '../v7';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 7);

    // Bump wallet version.
    walletData.version = 8;
};

export default map(v7Schema, (schema) => {
    if (schema.name === 'WalletSettings') {
        return omit(schema, 'properties.availableCurrencies');
    }

    return schema;
});

export { migration };
