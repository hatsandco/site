const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const browserSync = require('browser-sync').create();


const SCSS_GLOB = 'src/scss/**/*.scss';

const HTML_GLOB = 'src/**/*.html';

const ASSETS_GLOB = 'src/assets/**/*';


gulp.task('serve', ['scss', 'html', 'assets'], function () {

  browserSync.init({
    server: './dist',
    index: 'index.html',
    notify: false,
  });

  gulp.watch(SCSS_GLOB, ['scss']);
  gulp.watch(HTML_GLOB, ['html']);
  gulp.watch(ASSETS_GLOB, ['assets']);
});


gulp.task('scss', () => {
  return gulp.src(SCSS_GLOB)
    .pipe(gulpSass({
      outputStyle: 'compressed',
      includePaths: 'node_modules',
    }).on('error', gulpSass.logError))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('assets', () => {
  return gulp.src(ASSETS_GLOB)
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());    
});


gulp.task('html', () => {
  gulp.src(HTML_GLOB)
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
    }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
});


gulp.task('default', ['serve']);
