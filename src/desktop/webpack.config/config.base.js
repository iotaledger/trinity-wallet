const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        path: path.join(__dirname, '..', 'dist'),
        pathinfo: true,
        filename: 'bundle.js',
        publicPath: '/',
    },
    module: {
        rules: [
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
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['css-hot-loader'].concat(
                    ExtractTextPlugin.extract({
                        publicPath: process.env.NODE_ENV === 'production' ? '../' : undefined,
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    camelCase: true,
                                    modules: true,
                                    importLoaders: 1,
                                    localIdentName:
                                        process.env.NODE_ENV === 'production' ? '[hash:base64]' : '[name]__[local]',
                                    sourceMap: true,
                                },
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true,
                                },
                            },
                        ],
                    }),
                ),
            },
            {
                test: /\.(png|jpg|jpeg|svg|ttf|woff)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: 'images/[hash:8].[ext]',
                        },
                    },
                ],
            },
            {
                test: /\.workers?\.js$/,
                use: { loader: 'worker-loader' },
            },
        ],
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, '..', 'src'), path.resolve(__dirname, '..', '..', 'shared')],
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new ExtractTextPlugin({
            filename: 'css/[name].css',
            allChunks: false,
        }),
        new HtmlWebpackPlugin({
            title: 'IOTA Light Wallet',
            inject: false,
            template: __dirname + '/index.html',
        }),
    ],
};
