"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.groupBy = exports.sleepWith = exports.sleep = exports.unique = exports.cloneObject = exports.isObject = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isObject = function isObject(obj) {
  return _typeof(obj) === 'object' && !Array.isArray(obj) && obj !== null;
};

exports.isObject = isObject;

var cloneObject = function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
};

exports.cloneObject = cloneObject;

var unique = function unique(arr) {
  return _toConsumableArray(new Set(arr));
};

exports.unique = unique;

var sleep = function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

exports.sleep = sleep;

var sleepWith = function sleepWith(data, ms) {
  return new Promise(function (resolve) {
    return setTimeout(function () {
      return resolve(data);
    }, ms);
  });
};

exports.sleepWith = sleepWith;

var groupBy = function groupBy(xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

exports.groupBy = groupBy;