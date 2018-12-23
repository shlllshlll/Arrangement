"use strict";

/*
 * @Author: SHLLL
 * @Date:   2018-10-01 10:56:47
 * @Last Modified by:   SHLLL
 * @Last Modified time: 2018-10-14 12:38:10
 */

/**
 * Requirejs configure.
 * @type {Object}
 */
requirejs.config({
  bundles: {
    "common": ["datatables"]
  }
});
/**
 * Common reqiure modules.
 */

requirejs(["bootstrap", "bootstrap.notify", "bootstrap.dashboard"]);