const presets = ['@babel/preset-env'];
const plugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: false }],
  ['@babel/plugin-proposal-object-rest-spread']
];
const ignore = [/node_modules\/(?!cross-fetch)/];

module.exports = { presets, plugins, ignore };
