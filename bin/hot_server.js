import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import config from "../webpack.config";

config.entry.unshift(
  "webpack-dev-server/client?http://0.0.0.0:3000",
  "webpack/hot/only-dev-server"
);

config.plugins.push(
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
);

config.module.loaders.unshift({
  loader: "react-hot",
});

let server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
});

server.listen(3000, "localhost", (err) => {
  /*eslint-disable no-console*/
  if (err) console.log(err);
  else console.log("Listening at localhost:3000");
  /*eslint-enable no-console*/
});
