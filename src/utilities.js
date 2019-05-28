const isObject = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

const cloneObject = obj => JSON.parse(JSON.stringify(obj));

const unique = arr => [...new Set(arr)];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const sleepWith = (data, ms) => new Promise(resolve => setTimeout(() => resolve(data), ms));

const groupBy = (xs, key) => {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const roundTo = (num, digits = 2) => Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);

export { isObject, cloneObject, unique, sleep, sleepWith, groupBy, roundTo };
