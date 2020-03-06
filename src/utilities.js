import moment from 'moment';
import getSlug from 'speakingurl';
import generate from 'nanoid/generate';

import { Base64 } from 'js-base64';
import { diff, addedDiff, deletedDiff, updatedDiff, detailedDiff } from 'deep-object-diff';

const base64 = Base64;

const objectDiff = {
  diff,
  addedDiff,
  deletedDiff,
  updatedDiff,
  detailedDiff
};

const isArray = obj => typeof obj === 'object' && Array.isArray(obj);

const isObject = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

const cloneObject = obj => JSON.parse(JSON.stringify(obj));

const unique = array => Array.from(new Set(array)); // array.filter((obj, idx, nodes) => nodes.indexOf(obj) === idx);

const uniqueSet = array => Array.from(new Set(array)); // [...new Set(array)];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const sleepWith = (data, ms) => new Promise(resolve => setTimeout(() => resolve(data), ms));

const groupBy = (array, key) => {
  return array.reduce((acc, obj) => {
    (acc[obj[key]] = acc[obj[key]] || []).push(obj);
    return acc;
  }, {});
};

const flatten = array => array.reduce((acc, obj) => acc.concat(Array.isArray(obj) ? flatten(obj) : obj), []);

const clamp = (num, min, max) => Math.min(Math.max(min, num), max);

const roundTo = (num, digits = 2) => Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);

const debounce = (callback, wait, immediate = false) => {
  let timeout;

  return (...args) => {
    const context = this;
    const callNow = immediate && !timeout;
    const next = () => callback.apply(context, args);

    clearTimeout(timeout);
    timeout = setTimeout(next, wait);

    if (callNow) {
      next();
    }
  };
};

/**
 * ==================================================
 * = Code Diaries
 * = Chapter: My week is not your week
 * ==================================================
 *
 * Some weeks tend to start in the past year, so the
 * first week can break your code in unexpected ways
 *
 * ..to be continued
 */
const objToMoment = (obj, inputFormat, strictCheck = true) => {
  let date = moment.utc(obj, inputFormat, strictCheck);
  const lowerInputFormat = inputFormat.toLowerCase();
  if (lowerInputFormat.includes('w') && date.week() === 1) {
    date = date.endOf('week').startOf('day');
  }

  const isHourDay = lowerInputFormat === 'hh:mm' || lowerInputFormat.includes('d');
  const isYearQuarterMonth = lowerInputFormat === 'yyyy' || lowerInputFormat.includes('q') || lowerInputFormat.includes('m');

  if (!isHourDay && isYearQuarterMonth) {
    date = date.add(1, 'days');
  }

  return date;
};

const momentToStr = (obj, outputFormat, locale = 'en-US') => {
  let language = 'en';
  if (locale) {
    language = locale.substring(0, 2);
  }

  obj = moment.isMoment(obj) ? obj : moment(obj);
  return obj.locale(language).format(outputFormat);
};

const guessDateFormat = obj => {
  return moment(obj).creationData().format;
};

const convertQuillToString = delta => {
  if (typeof delta === 'string') delta = JSON.parse(delta);

  return delta.ops.reduce((text, op) => {
    if (!op.insert) throw new TypeError('only `insert` operations can be transformed!');
    if (typeof op.insert !== 'string') return text + ' ';
    return text + op.insert;
  }, '');
};

const visualizations = {
  collection: 'collection',
  dataset: 'dataset',
  atlas: 'atlas',
  report: 'report',
  choropleth: 'choro',
  areachart: 'area',
  linechart: 'line',
  barchart: 'bar-vertical',
  horizontalbarchart: 'bar-horizontal',
  groupedbarchart: 'bar-grouped-vertical',
  stackedbarchart: 'bar-stacked-vertical',
  donutchart: 'donut',
  donutchart_half: 'donut',
  'bar-grouped-horizontal': 'bar-grouped-horizontal',
  'bar-stacked-horizontal': 'bar-stacked-horizontal'
};

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const createHashSlug = instance => {
  const contentName = instance.get('name');
  const contentType = instance.get('type');

  const hashId = generate(alphabet, 16);
  const nameSlug = getSlug(contentName, { truncate: 32 });
  const niceType = visualizations[contentType] || 'unknown';

  const fullSlug = hashId + '-' + niceType + '-' + nameSlug;
  return fullSlug;
};

const createTagHashSlug = instance => {
  const contentName = instance.get('label');

  const hashId = generate(alphabet, 16);
  const nameSlug = getSlug(contentName, { truncate: 32 });

  const fullSlug = nameSlug + '-' + hashId;
  return fullSlug;
};

export {
  base64,
  objectDiff,
  isArray,
  isObject,
  cloneObject,
  unique,
  uniqueSet,
  sleep,
  sleepWith,
  groupBy,
  flatten,
  clamp,
  roundTo,
  debounce,
  objToMoment,
  momentToStr,
  guessDateFormat,
  convertQuillToString,
  createHashSlug,
  createTagHashSlug
};
