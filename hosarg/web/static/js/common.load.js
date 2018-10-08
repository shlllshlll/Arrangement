/*
* @Author: SHLLL
* @Date:   2018-10-02 18:59:46
* @Email:  shlll7347@gmail.com
* @License MIT LICENSE
* @Last Modified by:   shlll
* @Last Modified time: 2018-10-02 19:33:19
*/

require(["jquery", "common.require"], function($){
    "use strict";
    const src = $("script[src$='/require.js']").attr("data-for");
    if(src)
        require([src]);
});
