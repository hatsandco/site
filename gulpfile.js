const path = require('path');

const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const ghPages = require('gulp-gh-pages');
const browserSync = require('browser-sync').create();
const swPrecache = require('sw-precache');


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


gulp.task('generate-service-worker', ['scss', 'html', 'assets'], callback => {
  const rootDir = 'dist';

  swPrecache.write(`${rootDir}/service-worker.js`, {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('deploy', ['generate-service-worker'], () => {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});


gulp.task('default', ['serve']);
