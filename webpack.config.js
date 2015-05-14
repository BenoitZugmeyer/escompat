"use strict";
let path = require("path");
let webpack = require("webpack");

let config = {
  context: path.resolve(__dirname, "src"),
  entry: ["./main"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
    publicPath: "/dist/"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || "")
      },
    }),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|src\/data\//,
        loaders: ["babel-loader"],
      }
    ],
  }
};

if (process.env.NODE_ENV === "production") {
  config.plugins.push(
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  );
}

module.exports = config;
