import merge from 'lodash/merge';
import map from 'lodash/map';
import defaultSchemas from '../default';

export const migration = () => {};

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
