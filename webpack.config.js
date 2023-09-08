const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
  entry: [
    './src/index.tsx'
  ],
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'app.bundle.js'
  },
  mode: "development",
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    'static': {
      directory: './dist'
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
    })
  ]
};

module.exports = config;