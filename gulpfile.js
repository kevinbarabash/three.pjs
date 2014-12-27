var gulp = require('gulp');
var to5 = require('gulp-6to5');
var watch = require('gulp-watch');

gulp.task('default', function () {
    gulp.src('src/*.js')
        .pipe(watch('src/*.js'))
        .pipe(to5())
        .pipe(gulp.dest('./lib/'));
});
