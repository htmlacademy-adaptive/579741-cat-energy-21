const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es");
const del = require("del");


const stylesDev = () => {
  return gulp
    .src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([autoprefixer()]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
};

const stylesBuild = () => {
  return gulp
    .src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([autoprefixer(), csso()]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.stylesBuild = stylesBuild;
exports.stylesDev = stylesDev;

// Clean

const clean = () => {
  return del("build");
};

exports.clean = clean;


// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("stylesBuild"));
  gulp.watch("source/*.html").on("change", sync.reload);
};


// Images

const images = () => {
  return gulp
    .src("source/img/**/*.{jpg,png,svg}")
    .pipe(
      imagemin([
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest("build/img"));
};

exports.images = images;

// Webp

const createWebp = () => {
  return gulp
    .src("source/img/**/*.{jpg,png,}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("build/img"));
};

exports.createWebp = createWebp;

// Sprite

const sprite = () => {
  return gulp
    .src("source/img/icons/*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};

exports.sprite = sprite;

// HTML

const html = () => {
  return gulp
    .src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
};

exports.html = html;

// Scripts

const scripts= () => {
  return gulp.src("source/js/script.js")
  .pipe(uglify())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest("build/js"))
  .pipe(sync.stream());

}

exports.scripts = scripts;

// Copy

const copy = () => {
  return gulp
    .src(
      [
        "source/fonts/*{woff2,woff}",
        "source/*.ico",
        "source/img/**/*.{jpg,png,svg}",
      ],
      {
        base: "source",
      }
    )
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Build

const build = gulp.series(
  clean,
  gulp.parallel(stylesBuild, html, sprite, copy, images, createWebp)
);

exports.build = build;


// Start

exports.default = gulp.series(build, server, watcher);
