import { isObject, cloneObject, unique, sleep, sleepWith, groupBy } from './utilities';
import { getLayoutChild } from './content/layout';
import {
  getFormatObject,
  getExtendedFormatObject,
  getFormatShadowObject,
  getFormatLineHeightObject,
  getFormatMarginPaddingObject,
  convertFormatToExtendedFormat
} from './content/style';

const magicExport = () => {
  console.log('magic export is crazy');
};

// Webpack somehow requires proper objects ..
const utilities = { isObject, cloneObject, unique, sleep, sleepWith, groupBy };
const layout = { getLayoutChild };
const style = {
  getFormatObject,
  getExtendedFormatObject,
  getFormatShadowObject,
  getFormatLineHeightObject,
  getFormatMarginPaddingObject,
  convertFormatToExtendedFormat
};

export { magicExport, utilities, layout, style };
