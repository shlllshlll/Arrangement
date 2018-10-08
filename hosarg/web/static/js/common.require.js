/*
 * @Author: SHLLL
 * @Date:   2018-10-01 10:56:47
 * @Last Modified by:   shlll
 * @Last Modified time: 2018-10-02 18:11:40
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
requirejs([
    "bootstrap",
    "bootstrap.notify",
    "bootstrap.dashboard"
]);
