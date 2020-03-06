import { cloneObject } from '../utilities';
/**
 * WARNING - DO NOT TOUCH
 *
 * ALL THE FUNCTIONS ARE USED MULTIPLE TIMES IN CONTENT VALIDATOR !
 *
 * DO NOT TOUCH WITHOUT TALKING TO EVERYBODY
 *
 */
const getFormatObject = (size = 12, weight = '300', position = 'left', color = '#000000') => {
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

const getFormatShadowObject = (x = 0, y = 0, blur = 0, spread = 0, color = 'transparent') => {
  return {
    x: x,
    y: y,
    blur: blur,
    spread: spread,
    color: color
  };
};

const getFormatLineHeightObject = (value = 1.2, unit = 'em') => {
  return {
    value: value,
    unit: unit
  };
};

const getFormatMarginPaddingObject = (top = 0, topUnit = 'px', right = 0, rightUnit = 'px', bottom = 0, bottomUnit = 'px', left = 0, leftUnit = 'px') => {
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

const getExtendedFormatObject = (size, weight, position, color, shadow, lineheight, padding, margin) => {
  const format = getFormatObject(size, weight, position, color);
  format['shadow'] = shadow ? shadow : getFormatShadowObject();
  format['lineheight'] = lineheight ? lineheight : getFormatLineHeightObject();
  format['margin'] = margin ? margin : getFormatMarginPaddingObject();
  format['padding'] = padding ? padding : getFormatMarginPaddingObject();
  return format;
};

const convertFormatToExtendedFormat = (format, extendedFormat) => {
  format.enabled = format.hasOwnProperty('enabled') ? format.enabled : true;
  format.position = format.hasOwnProperty('position') ? format.position : 'left';
  format.size = format.hasOwnProperty('size') ? format.size : 12;
  format.weight = format.hasOwnProperty('weight') ? String(format.weight) : '300';
  format.color = format.hasOwnProperty('color') ? format.color : '#000000';
  format.fontFamily = format.hasOwnProperty('fontFamily') ? format.fontFamily : "'Work Sans', sans-serif";
  format.letterSpacing = format.hasOwnProperty('letterSpacing') ? format.letterSpacing : 0;

  format.shadow = format.shadow || cloneObject(extendedFormat.shadow);
  format.margin = format.margin || cloneObject(extendedFormat.margin);
  format.padding = format.padding || cloneObject(extendedFormat.padding);
  format.lineheight = format.lineheight || cloneObject(extendedFormat.lineheight);
  return format;
};

export { getFormatObject, getExtendedFormatObject, getFormatShadowObject, getFormatLineHeightObject, getFormatMarginPaddingObject, convertFormatToExtendedFormat };
