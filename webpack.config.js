const path = require('path');
const express = require('express');

module.exports = {
  devServer: {
    setup: function(app, server) {
      const staticPath = path.join(__dirname, 'src', 'static');
      app.use('/static', express.static(staticPath));
    },
    contentBase: path.join(__dirname, 'src'),
    publicPath: '/dist/',
    host: '0.0.0.0',
    allowedHosts: [
      'localhost'
    ],
    historyApiFallback: true,
    disableHostCheck: true,
    watchContentBase: true,
    compress: true,
    port: 9000
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        }
      }
    ]
  }
};
