const fs = require('fs');
const path = require('path');

const gulp = require('gulp');
const gulpSass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const ghPages = require('gulp-gh-pages');
const browserSync = require('browser-sync').create();

const SRC_DIR = 'src';

const SCSS_GLOB = `${SRC_DIR}/scss/**/*.scss`;

const HTML_GLOB = `${SRC_DIR}/**/index.html`;

const ASSETS_GLOB = `${SRC_DIR}/assets/**/*`;


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

gulp.task('create-redirects', complete => {
  const redirect_html = fs.readFileSync(path.join(SRC_DIR, 'redirect.html'));
  const redirects = ['hats', 'accessories', 'contact_us', 'faq', 'testimonials', 'directions'];
  redirects.forEach(redirect => {
    const outputPath = path.join('./dist', `${redirect}.html`);
    fs.writeFileSync(outputPath, redirect_html);
  });
  complete();
});


gulp.task('deploy', ['scss', 'html', 'assets', 'create-redirects'], () => {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});


gulp.task('default', ['serve']);
