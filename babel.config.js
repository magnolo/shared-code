const presets = [
  [
    '@babel/preset-env',
    {
      modules: 'umd',
      targets: {
        node: 'current',
        esmodules: false
      }
    }
  ]
];

const plugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  ['@babel/plugin-proposal-class-properties', { loose: false }],
  ['@babel/plugin-proposal-object-rest-spread']
  // ['@babel/plugin-transform-regenerator'],
  // ['@babel/plugin-transform-runtime']
];

const ignore = [/node_modules\/(?!cross-fetch)/];

module.exports = { presets, plugins, ignore };
