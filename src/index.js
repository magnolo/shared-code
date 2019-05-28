import { isObject, cloneObject, unique, sleep, sleepWith, groupBy, roundTo } from './utilities';
import { createLayoutObject, getLayoutChildObjects, createAtlasLayout, createVisualLayout, validateLayout } from './content/layout';
import {
  getFormatObject,
  getExtendedFormatObject,
  getFormatShadowObject,
  getFormatLineHeightObject,
  getFormatMarginPaddingObject,
  convertFormatToExtendedFormat
} from './content/style';

const magicExport = () => {
  console.log('magic export is crazy development');
};

// Webpack somehow requires proper objects ..
const utilities = { isObject, cloneObject, unique, sleep, sleepWith, groupBy, roundTo };
const layout = { createLayoutObject, getLayoutChildObjects, createAtlasLayout, createVisualLayout, validateLayout };
const style = {
  getFormatObject,
  getExtendedFormatObject,
  getFormatShadowObject,
  getFormatLineHeightObject,
  getFormatMarginPaddingObject,
  convertFormatToExtendedFormat
};

export { magicExport, utilities, layout, style };
