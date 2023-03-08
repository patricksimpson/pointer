const path = require("path");
const express = require("express");
const dotenv = require("dotenv-webpack");

module.exports = () => {
  return {
    plugins: [new dotenv()],
    devServer: {
      setup: function (app, server) {
        const staticPath = path.join(__dirname, "src", "static");
        app.use("/static", express.static(staticPath));
      },
      contentBase: path.join(__dirname, "src"),
      publicPath: "/dist/",
      host: "0.0.0.0",
      allowedHosts: ["localhost"],
      historyApiFallback: true,
      disableHostCheck: true,
      watchContentBase: true,
      compress: true,
      port: 9000,
    },
    output: {
      chunkFilename: "extra.js",
      filename: "main.js",
    },
    resolve: {
      extensions: [".js", ".mp3"],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.svg$/,
          loader: "svg-inline-loader",
        },
      ],
    },
  };
};
