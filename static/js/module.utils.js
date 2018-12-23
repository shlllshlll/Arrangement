"use strict";

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/*
 * @Author: SHLLL
 * @Date:   2018-10-03 17:07:51
 * @Email:  shlll7347@gmail.com
 * @License MIT LICENSE
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-25 01:11:15
 */
define(["jquery"], function ($) {
  var Utils = {};
  /**
   * Private static default get ajax options.
   * @type {Object}
   */

  var DEFAULTGETOPTS = {
    type: "get",
    dataType: 'json',
    xhrFields: {
      'Access-Control-Allow-Origin': '*'
    }
  };
  /**
   * Private static default post ajax options.
   * @type {Object}
   */

  var DEFAULTPOSTOPTS = {
    type: "POST",
    dataType: 'json',
    xhrFields: {
      'Access-Control-Allow-Origin': '*'
    }
  };
  /**
   * Get the object instance function.
   * @param  {Object} instance    Instance object
   * @param  {Constructor} constructor Constructor.
   * @param  {Array} args        Parameter array.
   * @return {Object}             New instance.
   */

  Utils.getInstance = function (instance, constructor, args) {
    return instance ? instance : _construct(constructor, _toConsumableArray(args));
  };
  /**
   * Public static get json data function.
   * @param  {Object} opts         Ajax options.
   * @param  {Function} doneCallback Request succeed call back.
   * @param  {Function} failCallback Request failed call back.
   * @return {null}              null
   */


  Utils.getJson = function (opts) {
    var doneCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var failCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    opts = Object.assign({}, DEFAULTGETOPTS, opts);
    $.ajax(opts).done(doneCallback).fail(failCallback);
  };
  /**
   * Public static post json data function.
   * @param {Object} opts         Ajax options.
   * @param {Function} doneCallback Request succeed call back.
   * @param {Function} failCallback Request failed call back.
   */


  Utils.postJson = function (opts) {
    var doneCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var failCallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    opts = Object.assign({}, DEFAULTPOSTOPTS, opts);
    $.ajax(opts).done(doneCallback).fail(failCallback);
  };
  /**
   * Convert col array to matrix.
   * @param  {Array} array Col array.
   * @param {String} placeholder Placeholder for element.
   * @return {Array}       Matric array.
   */


  Utils.arrayCol2Matrix = function (array) {
    var placeholder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var result = []; // Fisrt calculate the array length

    var arrayLen = array.map(function (item) {
      return item.length;
    }); // Then get the array max length

    var arrayLenMax = Math.max.apply(Math, _toConsumableArray(arrayLen)); // Fill the array to the max length

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;
        var arrayTmp = Array(arrayLenMax - item.length).fill(placeholder);
        arrayTmp = item.concat(arrayTmp);
        result.push(arrayTmp);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return result;
  };

  Utils.colMatrix2rowArray = function (matrix) {
    // Assert the input is column matrix
    var length = matrix[0].length;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = matrix[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var arr = _step2.value;

        if (arr.length !== length) {
          throw new ValueError('请确保输入的数据为列矩阵!');
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    var result = [];
    var mtxLength = matrix.length;

    for (var i = 0; i < length; i++) {
      var temp = [];

      for (var j = 0; j < mtxLength; j++) {
        temp.push(matrix[j][i]);
      }

      result.push(temp);
    }

    return result;
  };

  Utils.colArray2RowArray = function (array) {
    var placeholder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var mtx = Utils.arrayCol2Matrix(array, placeholder);
    return Utils.colMatrix2rowArray(mtx);
  };

  Utils.showModal = function (id, title, body, callBack, okBtnId) {
    var html = "<div class=\"modal fade\" id=\"".concat(id, "\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modalTitle\" aria-hidden=\"true\">\n                      <div class=\"modal-dialog\" role=\"document\">\n                        <div class=\"modal-content\">\n                          <div class=\"modal-header\">\n                            <h5 class=\"modal-title\">").concat(title, "</h5>\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                              <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                          </div>\n                          <div class=\"modal-body\">").concat(body, "</div>\n                          <div class=\"modal-footer\">\n                            <button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">\u53D6\u6D88</button>\n                            <button type=\"button\" class=\"btn btn-primary\" id=\"").concat(okBtnId, "\">\u786E\u8BA4</button>\n                          </div>\n                        </div>\n                      </div>\n                    </div>");

    if ($('#' + id).length === 0) {
      $('body').append(html);
    } else {
      $('#' + id).replaceWith(html);
    }

    $('#' + id).modal();
    $('#' + okBtnId).click(function () {
      // 隐藏模态框
      $('#' + id).modal('hide'); // 调用回调函数

      callBack ? callBack() : null;
    });
  };

  Utils.showModalNoBtn = function (id, title, body) {
    var html = "<div class=\"modal fade\" id=\"".concat(id, "\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"modalTitle\" aria-hidden=\"true\">\n                      <div class=\"modal-dialog\" role=\"document\">\n                        <div class=\"modal-content\">\n                          <div class=\"modal-header\">\n                            <h5 class=\"modal-title\">").concat(title, "</h5>\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\">\n                              <span aria-hidden=\"true\">&times;</span>\n                            </button>\n                          </div>\n                          <div class=\"modal-body\">").concat(body, "</div>\n                        </div>\n                      </div>\n                    </div>");

    if ($('#' + id).length === 0) {
      $('body').append(html);
    } else {
      $('#' + id).replaceWith(html);
    }

    $('#' + id).modal();
  };

  return Utils;
});