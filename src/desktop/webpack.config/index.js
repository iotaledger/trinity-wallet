module.exports = (env = 'development') => {
    return require(`./config.${env}`); // eslint-disable-line import/no-dynamic-require
};
