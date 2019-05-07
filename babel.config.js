const presets = ['@babel/preset-env'];
const plugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: false }],
  ['@babel/plugin-proposal-object-rest-spread']
];

module.exports = { presets, plugins };
