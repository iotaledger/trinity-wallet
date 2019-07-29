const path = require('path');
const metroBlacklist = require('metro-config/src/defaults/blacklist');

const SHARED = '../shared';

const alternateRoots = [path.join(__dirname, SHARED)];
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
            react: path.resolve(__dirname, SHARED, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, SHARED, 'node_modules/react-dom'),
            'react-redux': path.resolve(__dirname, SHARED, 'node_modules/react-redux'),
        },
    },
};
