const fs = require('fs');
const path = require('path');

const gulp = require('gulp');
const gutil = require('gulp-util');
const gulpSass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const runSequence = require('run-sequence');
const ghPages = require('gulp-gh-pages');
const browserSync = require('browser-sync').create();
const critical = require('critical').stream;
const del = require('del');


const SRC_DIR = 'src';

const DIST_DIR = 'dist';

const SCSS_GLOB = `${SRC_DIR}/scss/**/*.scss`;

const HTML_GLOB = `${SRC_DIR}/**/index.html`;

const ASSETS_GLOB = `${SRC_DIR}/assets/**/*`;


gulp.task('build', ['scss', 'html', 'assets']);


gulp.task('serve', ['build'], () => {
  browserSync.init({
    server: DIST_DIR,
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
    .pipe(gulp.dest(`${DIST_DIR}/css`))
    .pipe(browserSync.stream());
});

gulp.task('assets', () => {
  return gulp.src(ASSETS_GLOB)
    .pipe(gulp.dest(DIST_DIR))
    .pipe(browserSync.stream());
});


gulp.task('html', () => {
  gulp.src(HTML_GLOB)
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
    }))
    .pipe(gulp.dest(DIST_DIR))
    .pipe(browserSync.stream());
});


gulp.task('create-redirects', complete => {
  if (!fs.exists(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR);
  }
  const redirect_html = fs.readFileSync(path.join(SRC_DIR, 'redirect.html'));
  const redirects = ['hats', 'accessories', 'contact_us', 'faq', 'testimonials', 'directions'];
  redirects.forEach(redirect => {
    const outputPath = path.join(`./${DIST_DIR}`, `${redirect}.html`);
    fs.writeFileSync(outputPath, redirect_html);
  });
  complete();
});


gulp.task('clean-dist', () => {
  return del(DIST_DIR);
});


gulp.task('critical', ['build'], () => {
  return gulp.src(`${DIST_DIR}/index.html`)
    .pipe(critical({ 
      base: `${DIST_DIR}/`, 
      inline: true, 
      css: [`${DIST_DIR}/css/main.css`],
      minify: true,

    }))
    .on('error', err => gutil.log(gutil.colors.red(err.message)))
    .pipe(gulp.dest(DIST_DIR));
});


gulp.task('build-deploy', callback => {
  runSequence('clean-dist', ['critical', 'create-redirects'], callback);
})


gulp.task('deploy', ['build-deploy'], () => {
  return gulp.src(`./${DIST_DIR}/**/*`)
    .pipe(ghPages());
});


gulp.task('default', ['serve']);
