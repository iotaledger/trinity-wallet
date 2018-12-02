const path = require('path');
const metroBlacklist = require('metro-config/src/defaults/blacklist');

const alternateRoots = [path.join(__dirname, '../shared')];
const blacklist = metroBlacklist([/nodejs-project\/.*/]);

module.exports = {
    watchFolders: alternateRoots,
    resolver: {
        blacklistRE: blacklist,
    },
};
