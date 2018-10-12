const path = require('path');
const blacklist = require('metro-bundler/src/blacklist');

module.exports = {
    getProjectRoots: () => [__dirname, path.join(__dirname, '../shared')],
    extraNodeModules: {
        realm: path.resolve(__dirname, '../shared/node_modules/realm'),
    },
    getBlacklistRE: function() {
        return blacklist([/nodejs-project\/.*/]);
    },
};
