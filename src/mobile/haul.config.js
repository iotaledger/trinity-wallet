import { createWebpackConfig } from 'haul';
import path from 'path';

export default {
    webpack: (env) => {
        const config = createWebpackConfig({
            entry: './index.js',
        })(env);

        config.module.rules = [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
            {
                test: require.resolve('sjcl'),
                use: [
                    {
                        loader: 'imports-loader?sjcl',
                    },
                ],
            },
        ];

        config.resolve.modules = [
            'node_modules',
            path.resolve(__dirname, '.', 'src'),
            path.resolve(__dirname, '..', 'shared'),
        ];

        config.module.noParse = [/sjcl\.js$/];

        return config;
    },
};
