let Realm = null; // eslint-disable-line import/no-mutable-exports

const trinityEnv = global.TRINITY_ENV || process.env.TRINITY_ENV;

const hiddenRequire = require;

if (trinityEnv) {
    Realm = hiddenRequire(`../../${trinityEnv}/node_modules/realm`);
}

export default Realm;
