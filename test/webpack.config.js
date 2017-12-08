const resolve = require('path').resolve
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  entry: {
    index: [resolve(__dirname, 'index.js')]
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: '/'
  },

  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader!tunk-loader',
      exclude: /(node_modules)/
    }, {
      test: /\.(json)$/,
      loader: 'json-loader'
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: 'body'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin()
  ],
  devtool: '#eval-source-map'
}

