import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';
import map from 'lodash/map';
import defaultSchemas from '../default';

const migration = (oldRealm, newRealm) => {
    const oldWalletData = oldRealm.objectForPrimaryKey('Wallet', 0);
    const newWalletData = newRealm.objectForPrimaryKey('Wallet', 0);

    // Bump wallet version.
    newWalletData.version = 1;

    // Check if accountInfoDuringSetup.name was set in scheme version 0
    // If it was set, then that means there exists an account that hasn't been loaded properly in the wallet
    // It also means that "completed" property isn't set to true
    if (!isEmpty(oldWalletData.accountInfoDuringSetup.name)) {
        newWalletData.accountInfoDuringSetup.completed = true;
    }
};

export default map(defaultSchemas, (schema) => {
    if (schema.name === 'AccountInfoDuringSetup') {
        return merge({}, schema, {
            properties: {
                /**
                 * Determines if the account info is complete and account ready to be created and synced
                 */
                completed: {
                    type: 'bool',
                    default: false,
                },
            },
        });
    }

    return schema;
});

export { migration };
