/**
 * Realm database mock for Windows 7 compatibility
 */
const handler = {
    get: function(_target, name) {
        return name;
    },
};

class Realm {
    constructor() {}
    objectForPrimaryKey = () => new Proxy({}, handler);
    schemaVersion = () => -1;
    objects = () => {};
    create = () => {};
    write = () => {};
    close = () => {};
}

export default Realm;
