import map from 'lodash/map';
import merge from 'lodash/merge';
import each from 'lodash/each';
import v8Schema from '../v8';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 8);
    const newWalletSettings = newRealm.objects('WalletSettings');

    // Bump wallet version.
    walletData.version = 9;
    each(newWalletSettings, (settings) => {
        settings.chartTimeframe = '24h';
        settings.chartCurrency = 'USD';
    });
};

export default map(v8Schema, (schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                /*
                 * Selected chart timeframe
                 */
                chartTimeframe: {
                    type: 'string',
                    default: '',
                },
                /*
                 * Selected chart currency
                 */
                chartCurrency: {
                    type: 'string',
                    default: '',
                },
            },
        });
    }

    return schema;
});

export { migration };
