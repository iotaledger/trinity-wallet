import map from 'lodash/map';
import each from 'lodash/each';
import merge from 'lodash/merge';
import v9Schema from '../v9';

const migration = (oldRealm, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 9);
    const newWalletSettings = newRealm.objects('WalletSettings');
    const newNotificationsSettings = newRealm.objects('NotificationsSettings');
    // Bump wallet version.
    walletData.version = 10;

    each(newWalletSettings, (settings) => {
        settings.hideEmptyTransactions = true;
    });

    each(newNotificationsSettings, (newSettings) => {
        newSettings.messages = false;
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
                chartTimeframe: {
                    type: 'string',
                    default: '24h',
                },
                chartCurrency: {
                    type: 'string',
                    default: 'USD',
                },
            },
        });
    }
    if (schema.name === 'NotificationsSettings') {
        return merge({}, schema, {
            properties: {
                general: {
                    type: 'bool',
                    default: true,
                },
                confirmations: {
                    type: 'bool',
                    default: true,
                },
                messages: {
                    type: 'bool',
                    default: false,
                },
            },
        });
    }

    return schema;
});

export { migration };
