var gulp = require('gulp');

gulp.task('hello', function() {
    console.log('hello world!');
});

gulp.task('watch', function() {
    gulp.watch('./*.js');
    gulp.watch('./*.html');
});

gulp.task('webserver', function() {
    gulp.src('./dist')
        .pipe(
            webserver({
                host: '',
                livereload: true
            })
        );
});

gulp.task('default', ['hello']);