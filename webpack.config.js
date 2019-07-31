const path = require('path');
const webpack = require('webpack');

const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'development',
  entry: {
    index: ['./src/index']
  },
  output: {
    library: 'shared-code',
    libraryTarget: 'umd',
    globalObject: 'this',
    umdNamedDefine: true,
    publicPath: '/',
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new Visualizer(),
    new BundleAnalyzer({
      analyzerMode: 'static',
      openAnalyzer: false
    })
  ]
};
