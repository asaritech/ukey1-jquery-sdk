var gulp = require('gulp');
var header = require('gulp-header');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

var banner = [
	'/*!\n',
	' * Ukey1 Jquery plugin (<%= pkg.repository.url %>)\n',
	' * Copyright ' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
	' * Licensed under <%= pkg.license %>\n',
	' */\n'
].join('');

gulp.task('minify-js', function() {
    return gulp.src('./src/jquery.ukey1.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['minify-js']);
