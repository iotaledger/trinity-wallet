module.exports = (env = 'development') => {
    return require(`./config.${env}`);
};
