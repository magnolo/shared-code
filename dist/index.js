"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.style = exports.layout = exports.utilities = exports.magicExport = void 0;

var _utilities = require("./utilities");

var _layout = require("./content/layout");

var _style = require("./content/style");

var magicExport = function magicExport() {
  console.log('magic export is crazy development');
}; // Webpack somehow requires proper objects ..


exports.magicExport = magicExport;
var utilities = {
  isObject: _utilities.isObject,
  cloneObject: _utilities.cloneObject,
  unique: _utilities.unique,
  sleep: _utilities.sleep,
  sleepWith: _utilities.sleepWith,
  groupBy: _utilities.groupBy,
  roundTo: _utilities.roundTo
};
exports.utilities = utilities;
var layout = {
  createLayoutObject: _layout.createLayoutObject,
  getLayoutChildObjects: _layout.getLayoutChildObjects,
  createAtlasLayout: _layout.createAtlasLayout,
  createVisualLayout: _layout.createVisualLayout,
  validateLayout: _layout.validateLayout
};
exports.layout = layout;
var style = {
  getFormatObject: _style.getFormatObject,
  getExtendedFormatObject: _style.getExtendedFormatObject,
  getFormatShadowObject: _style.getFormatShadowObject,
  getFormatLineHeightObject: _style.getFormatLineHeightObject,
  getFormatMarginPaddingObject: _style.getFormatMarginPaddingObject,
  convertFormatToExtendedFormat: _style.convertFormatToExtendedFormat
};
exports.style = style;