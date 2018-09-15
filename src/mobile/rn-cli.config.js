const path = require('path');
const blacklist = require('metro-bundler/src/blacklist');

module.exports = {
    getProjectRoots: () => [__dirname, path.join(__dirname, '../shared')],
    getBlacklistRE: function() {
        return blacklist([/nodejs-project\/.*/]);
    },
};
