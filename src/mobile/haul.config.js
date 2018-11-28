import { createWebpackConfig } from 'haul';

export default {
    webpack: (env) => {
        const config = createWebpackConfig({
            entry: './index.js',
        })(env);

        return config;
    },
};
