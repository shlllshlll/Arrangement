/*
* @Author: SHLLL
* @Date:   2018-09-30 13:43:41
* @Last Modified by:   SHLLL
* @Last Modified time: 2018-09-30 15:42:20
*/
requirejs.config({
    paths: {
        xlsx: "plugins/xlsx.full.min",
        jquery: 'core/jquery.3.3.1.min',
        datatables: 'plugins/datatables.min',
        bootstrap: 'core/bootstrap.bundle.min',
        "dataTables.cellEdit": 'plugins/dataTables.cellEdit'
    },
    shim: {
        // "dataTables.cellEdit": {
        //     deps: ['datatables']
        // }
    }
});

requirejs(["ward"]);
