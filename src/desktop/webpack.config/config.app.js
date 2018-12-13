const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

const config = {
    entry: ['./src/index.js'],
    mode: devMode ? 'development' : 'production',
    output: {
        path: path.join(__dirname, '..', 'dist'),
        pathinfo: false,
        filename: 'bundle.js',
        globalObject: 'this',
        publicPath: '/',
    },
    devtool: devMode ? 'eval-source-map' : 'source-map',
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
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [
                    devMode
                        ? 'style-loader'
                        : {
                              loader: MiniCssExtractPlugin.loader,
                              options: {
                                  publicPath: '../',
                              },
                          },
                    {
                        loader: 'css-loader',
                        options: {
                            camelCase: true,
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]__[local]',
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: ['./src/ui/'],
                            implementation: require('dart-sass'),
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|svg|ttf|woff)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            name: 'images/[hash:8].[ext]',
                            publicPath: '../',
                        },
                    },
                ],
            },
            { test: /\.node$/, loader: 'node-loader' },
        ],
    },
    resolve: {
        modules: ['node_modules', path.resolve(__dirname, '..', 'src'), path.resolve(__dirname, '..', '..', 'shared')],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new HtmlWebpackPlugin({
            title: 'Trinity',
            inject: false,
            template: __dirname + '/index.html',
        }),
    ],
};

if (devMode) {
    config.entry = ['webpack-hot-middleware/client?reload=true'].concat(config.entry);

    config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins);

    config.devServer = {
        contentBase: './dist',
        hot: true,
    };
}

module.exports = config;
