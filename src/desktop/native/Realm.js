/**
 * Realm database mock for Windows 7 compatibility
 */
class Realm {
    constructor() {}
    objectForPrimaryKey = () => {};
    schemaVersion = () => -1;
    objects = () => {};
    create = () => {};
    write = () => {};
    close = () => {};
}

export default Realm;
