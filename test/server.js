const config = require("./webpack.config.js");
const webpack = require('webpack');
const resolve = require('path').resolve;
const WebpackDevServer = require('webpack-dev-server');


config.entry.index.unshift(`webpack-dev-server/client?http://127.0.0.1:8080/`, "webpack/hot/dev-server");
const compiler = webpack(config);
const server = new WebpackDevServer(compiler, {
    contentBase: '/',
    publicPath: "/",
    hot: true,
    inline: true
});
server.listen(8080, '127.0.0.1', function () {
    console.log(`visit by http://127.0.0.1:8080/`)
});
