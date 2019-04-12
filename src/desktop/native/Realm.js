/**
 * Realm database mock for Windows 7 compataibillity
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
