/*
* @Author: SHLLL
* @Date:   2018-10-03 17:07:51
* @Email:  shlll7347@gmail.com
* @License MIT LICENSE
* @Last Modified by:   shlll
* @Last Modified time: 2018-10-08 08:59:59
*/

define(["jquery"], function($){
    let Utils = {};

    /**
     * Private static default get ajax options.
     * @type {Object}
     */
    const DEFAULTGETOPTS = {
        type: "get",
        dataType: 'json',
        xhrFields: { 'Access-Control-Allow-Origin': '*' }
    };

    /**
     * Private static default post ajax options.
     * @type {Object}
     */
    const DEFAULTPOSTOPTS = {
        type: "POST",
        dataType: 'json',
        xhrFields: { 'Access-Control-Allow-Origin': '*' }
    };

    /**
     * Get the object instance function.
     * @param  {Object} instance    Instance object
     * @param  {Constructoe} constructor Constructor.
     * @param  {Array} args        Parameter array.
     * @return {Object}             New instance.
     */
    Utils.getInstance = function(instance, constructor, args) {
        return instance ? instance : new constructor(...args);
    };

    /**
     * Public static get json data function.
     * @param  {Object} opts         Ajax options.
     * @param  {Function} doneCallback Request succeed call back.
     * @param  {Function} failCallback Request failed call back.
     * @return {null}              null
     */
    Utils.getJson = function(opts, doneCallback=null, failCallback=null) {
        opts = Object.assign({}, DEFAULTGETOPTS, opts);
        $.ajax(opts).done(doneCallback).fail(failCallback);
    };

    /**
     * Public static post json data function.
     * @param {Object} opts         Ajax options.
     * @param {Function} doneCallback Request succeed call back.
     * @param {Function} failCallback Request failed call back.
     */
    Utils.postJson = function(opts, doneCallback=null, failCallback=null) {
        opts = Object.assign({}, DEFAULTPOSTOPTS, opts);
        $.ajax(opts).done(doneCallback).fail(failCallback);
    };

    /**
     * Convert col array to matrix.
     * @param  {Array} array Col array.
     * @param {String} placeholder Placeholder for element.
     * @return {Array}       Matric array.
     */
    Utils.arrayCol2Matrix = function(array, placeholder='') {
        let result = [];
        // Fisrt calculate the array length
        let arrayLen = array.map(item=>{return item.length;});
        // Then get the array max length
        let arrayLenMax = Math.max(...arrayLen);
        // Fill the array to the max length
        for (let item of array) {
            let arrayTmp = Array(arrayLenMax - item.length).fill(placeholder);
            arrayTmp = item.concat(arrayTmp);
            result.push(arrayTmp);
        }
        return result;
    };

    Utils.colMatrix2rowArray = function(matrix) {
        // Assert the input is column matrix
        let length = matrix[0].length;
        for (let arr of matrix) {
            if(arr.length !== length) {
                throw new ValueError('请确保输入的数据为列矩阵!');
            }
        }

        let result = [];
        const mtxLength = matrix.length;
        for (let i = 0; i < length; i++) {
            let temp = [];
            for(let j = 0; j < mtxLength; j++) {
                temp.push(matrix[j][i]);
            }
            result.push(temp);
        }

        return result;
    };

    Utils.colArray2RowArray = function(array, placeholder='') {
        let mtx = Utils.arrayCol2Matrix(array, placeholder);
        return Utils.colMatrix2rowArray(mtx);
    };

    return Utils;
});
