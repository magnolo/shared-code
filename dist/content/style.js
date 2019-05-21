"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertFormatToExtendedFormat = exports.getFormatMarginPaddingObject = exports.getFormatLineHeightObject = exports.getFormatShadowObject = exports.getExtendedFormatObject = exports.getFormatObject = void 0;

var _utilities = require("../utilities");

/**
 * WARNING - DO NOT TOUCH
 *
 * ALL THE FUNCTIONS ARE USED MULTIPLE TIMES IN CONTENT VALIDATOR !
 *
 * DO NOT TOUCH WITHOUT TALKING TO EVERYBODY
 *
 */
var getFormatObject = function getFormatObject() {
  var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 12;
  var weight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '300';
  var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'left';
  var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '#000000';
  return {
    enabled: true,
    position: position,
    size: size,
    weight: String(weight),
    color: color,
    fontFamily: "'Work Sans', sans-serif",
    letterSpacing: 0
  };
};

exports.getFormatObject = getFormatObject;

var getFormatShadowObject = function getFormatShadowObject() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var blur = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var spread = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var color = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'transparent';
  return {
    x: x,
    y: y,
    blur: blur,
    spread: spread,
    color: color
  };
};

exports.getFormatShadowObject = getFormatShadowObject;

var getFormatLineHeightObject = function getFormatLineHeightObject() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1.2;
  var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'em';
  return {
    value: value,
    unit: unit
  };
};

exports.getFormatLineHeightObject = getFormatLineHeightObject;

var getFormatMarginPaddingObject = function getFormatMarginPaddingObject() {
  var top = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var topUnit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'px';
  var right = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var rightUnit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'px';
  var bottom = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var bottomUnit = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'px';
  var left = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
  var leftUnit = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 'px';
  return {
    top: top,
    right: right,
    topUnit: topUnit,
    bottom: bottom,
    left: left,
    rightUnit: rightUnit,
    bottomUnit: bottomUnit,
    leftUnit: leftUnit
  };
};

exports.getFormatMarginPaddingObject = getFormatMarginPaddingObject;

var getExtendedFormatObject = function getExtendedFormatObject(size, weight, position, color, shadow, lineheight, padding, margin) {
  var format = getFormatObject(size, weight, position, color);
  format['shadow'] = shadow ? shadow : getFormatShadowObject();
  format['lineheight'] = lineheight ? lineheight : getFormatLineHeightObject();
  format['margin'] = margin ? margin : getFormatMarginPaddingObject();
  format['padding'] = padding ? padding : getFormatMarginPaddingObject();
  return format;
};

exports.getExtendedFormatObject = getExtendedFormatObject;

var convertFormatToExtendedFormat = function convertFormatToExtendedFormat(format, extendedFormat) {
  format.shadow = format.shadow || (0, _utilities.cloneObject)(extendedFormat.shadow);
  format.margin = format.margin || (0, _utilities.cloneObject)(extendedFormat.margin);
  format.padding = format.padding || (0, _utilities.cloneObject)(extendedFormat.padding);
  format.lineheight = format.lineheight || (0, _utilities.cloneObject)(extendedFormat.lineheight);
  return format;
};

exports.convertFormatToExtendedFormat = convertFormatToExtendedFormat;