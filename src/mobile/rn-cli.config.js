const path = require('path');
const metroBlacklist = require('metro-config/src/defaults/blacklist');

const alternateRoots = [path.join(__dirname, '../shared')];
const blacklist = metroBlacklist([
    /nodejs-assets\/.*/,
    /android\/build\/.*/,
    /android\/app\/build\/.*/,
    /ios\/build\/.*/,
]);

module.exports = {
    watchFolders: alternateRoots,
    resolver: {
        blacklistRE: blacklist,
        extraNodeModules: {
            'react-native': path.resolve(__dirname, 'node_modules/react-native'),
        },
    },
};
