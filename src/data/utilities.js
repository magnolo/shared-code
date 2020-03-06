/**
 * gives the integer valu for decimal places with a maximum of 5
 * for a given float value
 * @param  {number} value  number to test
 * @return {integer}       decimal places <=5
 */
export const countDecimals = value => {
  if (Math.floor(value) === value) return 0;
  const split = value.toString().split('.');
  if (split.length > 1) {
    const decimals = value.toString().split('.')[1].length || 0;
    if (parseFloat(split[0]) > 0 && decimals > 5) {
      return 5;
    } else {
      return decimals;
    }
  } else {
    return 0;
  }
};

/**
 * converts a string value into a float value
 * if it is possible
 * @return a float value or the string value if no conversion was possible
 */
export const convertStringToValueIfPossible = (stringValue, preferedLocale = 'de-DE') => {
  let retObj = {
    value: undefined,
    prefix: undefined,
    suffix: undefined
  };

  let val = stringValue ? stringValue.toString().trim() : null;
  //console.log(val,preferedLocale);
  if (val) {
    // Test first for prefered Locale
    if (preferedLocale === 'de-DE') {
      retObj = findGermanNumber(val);
      //console.log("[Testing DE VAL FIRST]",retObj)
      if (retObj.value !== undefined) return retObj;
      retObj = findEnglishNumber(val);
      if (retObj.value !== undefined) return retObj;
    } else {
      // console.log("[Testing ENGLISCH VAL FIRST]",retObj)
      retObj = findEnglishNumber(val);
      if (retObj.value !== undefined) return retObj;
      retObj = findGermanNumber(val);
      if (retObj.value !== undefined) return retObj;
    }
  }
  retObj.value = val;
  return retObj;
};

/**
 * given a list of decimal places returns atm
 * average decimal part - this is a function so we can change the algorithm
 * to for example max and reuse it on separate occasions
 * @param  decimalPlacesList - list of decimal places (array of integers)
 * @return Integer
 */
export const getDecimalPlaces = decimalPlacesList => {
  return Math.round(
    decimalPlacesList.reduce((accumulator, obj) => {
      return accumulator + obj;
    }, 0) / decimalPlacesList.length
  );
};

// warning do not use global otherwise this breaks /g -> hidden state amazingness!
const germanNumberRegex = /^([€$]?\s?)[+]?([-]?[0-9]{1,3}(\.[0-9]{3})*(,[0-9]+)?|\d*\,\d+|\d+)(\s?[%]?)$/;
const englishNumberRegex = /^([€$]?\s?)[+]?([-]?[0-9]{1,3}(,[0-9]{3})*(\.[0-9]+)?|\d*\.\d+|\d+)(\s?[%]?)$/;

const findEnglishNumber = numStr => {
  const retObj = {
    value: undefined,
    prefix: undefined,
    suffix: undefined
  };

  const match = englishNumberRegex.exec(numStr);
  if (match) {
    let num = match[2];
    num = num.replace(/[,\+]/g, ''); // replace + and , (thousandSeparator) with nothing

    retObj.value = parseFloat(num);
    retObj.prefix = match[1];
    retObj.suffix = match[5];
  }

  return retObj;
};

const findGermanNumber = numStr => {
  const retObj = {
    value: undefined,
    prefix: undefined,
    suffix: undefined
  };

  const match = germanNumberRegex.exec(numStr);
  if (match) {
    let num = match[2];
    num = num.replace(/[\.\+]/g, ''); // replace , (comma separator) with . so it can be parsed
    num = num.replace(/,/g, '.');

    retObj.value = parseFloat(num);
    retObj.prefix = match[1];
    retObj.suffix = match[5];
  }

  return retObj;
};
