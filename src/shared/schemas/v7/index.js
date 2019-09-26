import each from 'lodash/each';
import get from 'lodash/get';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import map from 'lodash/map';
import v6Schema from '../v6';

const migration = (oldRealm, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 6);
    const oldNodes = oldRealm.objects('Node');
    const newNodes = newRealm.objects('Node');

    // Bump wallet version.
    walletData.version = 7;

    each(oldNodes, (oldNode) => {
        each(newNodes, (newNode) => {
            if (get(newNode, 'url') === get(oldNode, 'url')) {
                newNode.username = get(oldNode, 'token');
            }
        });
    });
};

export default map(v6Schema, (schema) => {
    if (schema.name === 'Node') {
        let newSchema = omit(schema, 'properties.token');
        return merge({}, newSchema, {
            properties: {
                /**
                 * (Optional) authentication token (username) for node
                 */
                username: {
                    type: 'string',
                    default: '',
                },
            },
        });
    }
    return schema;
});

export { migration };
