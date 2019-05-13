import merge from 'lodash/merge';
import map from 'lodash/map';
import v2Schema from '../v2';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 2);

    // Bump wallet version.
    walletData.version = 3;
};

export default map(v2Schema, (schema) => {
    if (schema.name === 'Node') {
        return merge({}, schema, {
            properties: {
                /**
                 * (Optional) authentication key for node
                 */
                authKey: {
                    type: 'string',
                    default: '',
                },
            },
        });
    }

    return schema;
});

export { migration };
