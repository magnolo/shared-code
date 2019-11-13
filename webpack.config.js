const path = require('path');
const webpack = require('webpack');

const Visualizer = require('webpack-visualizer-plugin');
const BundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const browserConfig = {
  target: 'web',
  mode: 'development',
  entry: {
    browser: ['./src/browser']
  },
  output: {
    library: 'shared-code',
    libraryTarget: 'umd',
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
    umdNamedDefine: false,
    publicPath: '/',
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    usedExports: true
  },
  plugins: [
    // new Visualizer({
    //   filename: 'stats-browser.html'
    // }),
    // new BundleAnalyzer({
    //   openAnalyzer: false,
    //   analyzerMode: 'static',
    //   reportFilename: 'report-browser.html'
    // })
    // new webpack.IgnorePlugin(/mongoose/)
  ]
};

const nodeConfig = {
  target: 'node',
  mode: 'development',
  entry: {
    node: ['./src/node']
  },
  output: {
    library: 'shared-code',
    libraryTarget: 'umd',
    globalObject: `(typeof self !== 'undefined' ? self : this)`,
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
  optimization: {
    usedExports: true
  },
  plugins: [
    // new Visualizer({
    //   filename: 'stats-node.html'
    // }),
    // new BundleAnalyzer({
    //   openAnalyzer: false,
    //   analyzerMode: 'static',
    //   reportFilename: 'report-node.html'
    // })
    // new webpack.IgnorePlugin(/mongoose/)
  ]
};

const config = process.argv.includes('--browser') ? browserConfig : nodeConfig;

module.exports = config;
