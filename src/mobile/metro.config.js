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
            react: path.resolve(__dirname, '../shared/node_modules/react'),
            'react-dom': path.resolve(__dirname, '../shared/node_modules/react-dom'),
            'react-i18next': path.resolve(__dirname, '../shared/node_modules/react-i18next'),
            'react-redux': path.resolve(__dirname, '../shared/node_modules/react-redux'),
            'react-native': path.resolve(__dirname, 'node_modules/react-native'),
        },
    },
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: false,
            },
        }),
    },
};
