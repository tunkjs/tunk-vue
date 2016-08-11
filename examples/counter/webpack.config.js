'use strict';
// 清除生成目录文件
let exec = require('child_process').execSync;
exec('rm -rf build/*');

let path = require('path');
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool : 'cheap-module-eval-source-map',
    entry: {
        main:'./index.js',
    },
    output: {
        path: __dirname + '/build/',
        filename: '[name].bundle.js',
        publicPath: '/build/',
        chunkFilename: '[id].bundle.js?[chunkhash]',
    },
    resolve: {
        // 依赖库配置
        alias: commonAlias
    },
    // 插件配置
    plugins: [
        new ExtractTextPlugin('style.css')
    ],
    module: {
        loaders: [
            {
                test: /\.vue$/,
                loader: 'vue',
            },
            // js代码loaders处理
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /(node_modules|ckeditor)/
            },

            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            },

            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.(jpg|png)$/,
                loader: "url?limit=8192"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            },

            {
                test: /\.scss$/,
                loader: 'style!css!sass'
            },

        ],
    },
    babel: {
        presets: ['es2015'],
        plugins: ['transform-runtime'],
    },
    vue: {
        loaders: {
            js: 'babel',
            html: 'vue-html-loader',
        }
    },
};
