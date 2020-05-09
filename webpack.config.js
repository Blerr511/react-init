'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '.env') });
module.exports = (env, argv) => {
  const definePlugin = new Object();
  if (dotenv.parsed.HOST)
    definePlugin['process.env.HOST'] = JSON.stringify(dotenv.parsed.HOST);
  if (dotenv.parsed.PORT)
    definePlugin['process.env.PORT'] = JSON.stringify(dotenv.parsed.PORT);
  if (dotenv.parsed.PUBLIC_PATH)
    definePlugin['process.env.PUBLIC_PATH'] = JSON.stringify(dotenv.parsed.PUBLIC_PATH);

  definePlugin['process.env.MODE'] =
    argv.mode == 'production'
      ? JSON.stringify(argv.mode)
      : JSON.stringify('development');
  return {
    entry: './src/index.js',
    context: path.resolve(__dirname),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[name].[hash].js',
      publicPath: process.env.PUBLIC_PATH || '/',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.less$/,
          use: ['style-loader', 'css-loader', 'less-loader'],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg|png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/,
          use: 'url-loader?limit=10000&name=assets/[hash].[ext]',
        },
      ],
    },
    resolve: {},
    devServer: {
      historyApiFallback: true,
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost',
    },
    devtool: 'cheap-module-source-map',
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new webpack.DefinePlugin(definePlugin),
      new Dotenv({
        path: argv.mode == 'production' ? '.prod.env' : '.env',
      }),
      new ErrorOverlayPlugin(),
      new CopyWebpackPlugin([{ from: 'src/assets', to: 'assets' }]),
    ],
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 30000,
        maxSize: 3000000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        automaticNameDelimiter: '~',
        automaticNameMaxLength: 30,
        name: true,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
  };
};
