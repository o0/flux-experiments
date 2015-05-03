/**
 * @fileoverview Build configuration.
 * @author igor.alexeenko (Igor Alekseyenko)
 */

var path = require('path');

module.exports = {
  entry: {
    app: path.resolve('src/app.jsx')
  },
  output: {
    path: path.resolve('out'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      { test: /\.jsx/, loader: 'jsx' },
      { test: /\.scss/, loader: 'style!css!sass' }
    ]
  }
};
