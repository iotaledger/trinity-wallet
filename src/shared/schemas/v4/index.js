import merge from 'lodash/merge';
import map from 'lodash/map';
import v3Schema from '../v3';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 3);

    // Bump wallet version.
    walletData.version = 4;
};

export default map(v3Schema, (schema) => {
    if (schema.name === 'Transaction') {
        return merge({}, schema, {
            properties: {
                /**
                 * Total transaction autoretry attempts
                 */
                autoRetryAttempts: {
                    type: 'int',
                    default: 0,
                },
            },
        });
    }

    return schema;
});

export { migration };
