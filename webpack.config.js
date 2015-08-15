/*eslint-env node*/
import path from "path";
import webpack from "webpack";

let getPath = (fullPath) => path.resolve(__dirname, ...fullPath.split("/"));

let config = {
  context: getPath("src"),
  entry: ["./main"],
  output: {
    path: getPath("dist"),
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
        exclude: /node_modules|src\/data\.js/,
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

export default config;
