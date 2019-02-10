/*
 * @Author: SHLLL
 * @Date:   2018-09-23 09:14:57
 * @Last Modified by:   Mr.Shi
 * @Last Modified time: 2018-09-25 10:27:36
 */

const gulp = require('gulp'),
    gls = require('gulp-live-server'),
    fileinclude = require('gulp-file-include'),
    babel = require('gulp-babel'),
    replace = require('gulp-replace'),
    merge = require('merge-stream'),
    minify = require('gulp-minify');

function collectstatic() {
	return merge(
		gulp.src(['hosarg/web/static/**', '!hosarg/web/static/js/common*.js',
			'!hosarg/web/static/js/module.*.js', '!hosarg/web/static/js/page.*.js'])
			.pipe(minify({
				ext:{
					min:'.js'
				},
				noSource: true
			}))
			.pipe(gulp.dest('static')),
		gulp.src('hosarg/web/*.html')
			.pipe(minify({
				ext:{
					min:'.js'
				},
				noSource: true
			}))
			.pipe(gulp.dest('templete')),
		gulp.src('hosarg/web/static/js/common.js')
			.pipe(replace('//127.0.0.1:8080/api/', 'api/'))
			.pipe(minify({
				ext:{
					min:'.js'
				},
				noSource: true
			}))
			.pipe(gulp.dest('static/js')),
        gulp.src(['hosarg/web/static/js/common.*.js',
			'hosarg/web/static/js/module.*.js', 'hosarg/web/static/js/page.*.js'])
			.pipe(babel({
				presets: ['@babel/preset-env']
			}))
			.pipe(minify({
				ext:{
					min:'.js'
				},
				noSource: true
			}))
			.pipe(gulp.dest('static/js'))
	);
}

function file_include() {
	return gulp.src('hosarg/web/html/*.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest('hosarg/web'));
}

function serve(cb) {
	const server = gls.static('hosarg/web', 9999);
    server.start();

    // 对相应文件进行监视
    gulp.watch('hosarg/web/html/**').on('change', path => {
		file_include();
		server.notify.call(server, {path});
	});

    // 对相应文件进行监视
    gulp.watch('hosarg/web/static/**').on('change', path => {
		server.notify.call(server, {path});
	});

	cb();
}

exports.collectstatic = collectstatic;
exports.fileinclude = file_include;
exports.serve = serve;
