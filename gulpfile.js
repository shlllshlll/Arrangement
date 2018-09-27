/*
 * @Author: SHLLL
 * @Date:   2018-09-23 09:14:57
 * @Last Modified by:   Mr.Shi
 * @Last Modified time: 2018-09-25 10:27:36
 */
const gulp = require('gulp'),
    gls = require('gulp-live-server'),
    fileinclude = require('gulp-file-include');

gulp.task('collectstatic', () => {
    gulp.src(['hosarg/web/static/**', '!hosarg/web/static/js/common.js'])
        .pipe(gulp.dest('static'));

    gulp.src('hosarg/web/*.html')
        .pipe(gulp.dest('templete'));
});

gulp.task('fileinclude', () => {
    gulp.src('hosarg/web/html/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest('hosarg/web'));
});

gulp.task('serve', () => {
    var server = gls.static('hosarg/web', 8888);
    server.start();

    // 对相应文件进行监视
    gulp.watch('hosarg/web/html/**', (file) => {
        gulp.start('fileinclude');
        server.start.apply(server);
        server.notify.apply(server, [file]);
    });
    // 对相应文件进行监视
    gulp.watch('hosarg/web/static/**', (file) => {
        server.start.apply(server);
        server.notify.apply(server, [file]);
    });
});
