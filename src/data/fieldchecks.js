/**
 * Utility functions for checking if certain fields
 * can have different types
 */
import { convertStringToValueIfPossible, countDecimals, getDecimalPlaces } from './utilities';

/**
 * test if data from a list of fields can be converted to numbers
 *
 * @param  {Array<String>} fieldNames Array of fields to test
 * @param {Array<Objects>} data Array of data row objects where each row must have Key value Pairs where the keys have to be in fieldNames
 * @param {String} preferedLocale locale like (de-DE, ..) which is used for converting numbers preferable
 * @param {Number} limit on how many rows will the test be done - default 2000
 * @return {Object} testresults
 *
 * Testresult Object
 * {
 *  [fieldName]: {
 *    datalength : number,
 *    valid : integer,
 *    errors : integer,
 *    warnings: integer,
 *    decimalPlaces: integer,
 *    shorten : boolean,
 *    prefix : string,
 *    suffix : string,
 *  }
 * }
 *
 * Explanation:
 *
 * datalength: lines that wer tested
 * valid: amount of lines that can be converted to numbers
 * errors: amount of lines that could not be converted to a number
 * warnings: amount of lines that have no value at all (f.e empty string, null,..)
 * decimalPlaces: amount of decimmal places according to countDecimals()
 * shorten: should this be shortened
 * prefix: prefix that was detected if no prefix is there output=''
 * suffix: suffix that was detected if no suffix is there outpt = ''
 */
export const testFieldsAsValueField = (fieldNames, data, preferedLocale, limit = 2000) => {
  let results = {};
  const datalength = data.length > limit ? limit : data.length;
  // init results
  for (const fieldName of fieldNames) {
    results[fieldName] = {
      datalength: datalength,
      valid: 0,
      errors: 0,
      warning: 0,
      decimalPlaces: [],
      shorten: false,
      prefix: [],
      suffix: []
    };
  }
  let index = 0;
  for (const row of data) {
    for (const fieldName of fieldNames) {
      const retObj = convertStringToValueIfPossible(row[fieldName], preferedLocale);
      const value = retObj.value;
      const error = isNaN(value - parseFloat(value));
      if (error) {
        // is it a string?
        if (value === undefined || value === null || value.length === 0) {
          results[fieldName].warning = results[fieldName].warning + 1;
        } else {
          results[fieldName].errors = results[fieldName].errors + 1;
        }
      } else {
        // console.log('!!!', results[fieldName], retObj);
        if (retObj.prefix) {
          if (!results[fieldName].prefix.includes(retObj.prefix)) {
            results[fieldName].prefix.push(retObj.prefix);
          }
        }
        if (!retObj.prefix) {
          if (!results[fieldName].prefix.includes('')) {
            results[fieldName].prefix.push('');
          }
        }
        if (retObj.suffix) {
          if (!results[fieldName].suffix.includes(retObj.suffix)) {
            results[fieldName].suffix.push(retObj.suffix);
          }
        }
        if (!retObj.suffix) {
          if (!results[fieldName].suffix.includes('')) {
            results[fieldName].suffix.push('');
          }
        }
        results[fieldName].decimalPlaces.push(countDecimals(value));
        // TODO treat shorten as count decimals
        if (!results[fieldName].shorten) {
          results[fieldName].shorten = value > 99999 ? true : false;
        }
        results[fieldName].valid = results[fieldName].valid + 1;
      }
    }
    if (index === limit - 1) {
      break;
    }
    index = index + 1;
  }
  // console.log('[TEstREsults before rewurite ]', JSON.parse(JSON.stringify(results)));
  for (const fieldName of fieldNames) {
    // calc the decimals
    results[fieldName].decimalPlaces = getDecimalPlaces(results[fieldName].decimalPlaces);
    if (results[fieldName].prefix.length === 1) {
      results[fieldName].prefix = results[fieldName].prefix[0];
    } else {
      results[fieldName].prefix = '';
    }
    if (results[fieldName].suffix.length === 1) {
      results[fieldName].suffix = results[fieldName].suffix[0];
    } else {
      results[fieldName].suffix = '';
    }
  }
  return results;
};
