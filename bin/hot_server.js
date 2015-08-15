"use strict";
let webpack = require("webpack");
let WebpackDevServer = require("webpack-dev-server");
let config = require("../webpack.config");

config.entry.unshift(
  "webpack-dev-server/client?http://0.0.0.0:3000",
  "webpack/hot/only-dev-server"
);

config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
);

config.module.loaders[0].loaders.unshift("react-hot");

let server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
});

server.listen(3000, "localhost", function (err) {
  if (err) {
    console.log(err);
  }

  console.log("Listening at localhost:3000");
});
