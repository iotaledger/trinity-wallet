// const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
    entry: ['./src/index.js'],
    output: {
        path: path.join(__dirname, '..', 'dist'),
        pathinfo: true,
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{ loader: 'babel-loader' }]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ['css-hot-loader'].concat(
                    ExtractTextPlugin.extract({
                        use: [
                            {
                                loader: 'css-loader',
                                options: {
                                    camelCase: true,
                                    modules: true,
                                    importLoaders: 1,
                                    // localIdentName: '[hash:base64:5]' : '[name]__[local]',
                                    sourceMap: true
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    sourceMap: true
                                }
                            }
                        ]
                    })
                )
            }
        ]
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, '..', 'src'), path.resolve(__dirname, '..', '..', 'shared')]
    },
    plugins: [
        new CaseSensitivePathsPlugin(),
        new ExtractTextPlugin({
            filename: 'css/[name].css',
            allChunks: false
        }),
        new HtmlWebpackPlugin({
            title: 'IOTA Light Wallet',
            inject: false,
            template: __dirname + '/index.html'
        })
    ]
};
