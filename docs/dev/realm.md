## Migrating realm schema version

### iOS
1. Create a new directory in `shared/schemas/` with the version number. For example, if the next schema version is `7`, create a new directory named as `v7`. 

2. Create `index.js` inside the newly created directory in `shared/schemas/`.

3. Export the updated schemas as default. For example, if the updated schema has added a new property to `WalletSettings` schema, the default export should look like:

```javascript
import merge from 'lodash/merge';
import v6Schema from '../v6';

export default v6Schema.map((schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                foo: {
                    type: 'bool',
                    default: false,
                },
            },
        });
    }

    return schema;
});
```

**Note: Ensure to always extend the most recent schema (as shown in the above example). If the next schema version is going to be 7, we should make sure that we extend the most recent i.e., v6 schema.**

4. Export a realm [migration](https://realm.io/docs/javascript/latest/#migrations) function. 

5. Import updated schema and migration function in `shared/schema/index.js`. For example, if the updated schema is `v7`, the import in `shared/schema/index.js` should look like:

```javascript
import v7Schema, { migration as v7Migration } from './v7';
```

6. Append (updated) `schema`, `schemaVersion`, `path` and `migration` function to the default export array in `shared/schema/index.js`. 
