var path = require("path");
var webpack = require("webpack");

var plugins = [];

if (process.env.NODE_ENV === "production") {
  plugins.push(
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  );
}

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: "./main",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js",
    },
    plugins: plugins,
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules|src\/data\//,
          loader: "babel-loader",
        }
      ],
    }
};
