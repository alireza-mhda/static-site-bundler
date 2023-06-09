import browserSync from "browser-sync";
import gulp from "gulp";
import gulpCleanCss from "gulp-clean-css";
import gulpHtmlMin from "gulp-htmlmin";
import gulpIf from "gulp-if";
import gulpImagemin from "gulp-imagemin";
import gulpInject from "gulp-inject";
import gulpPostcss from "gulp-postcss";
import gulpSass from "gulp-sass";
import gulpSourcemaps from "gulp-sourcemaps";
import { rimraf } from "rimraf";
import sass from "sass";
import yargs from "yargs";
import { DistDir, Paths, Assets } from "./config";
import gulpUglify from "gulp-uglify";
import TerserPlugin from "terser-webpack-plugin";
import named from "vinyl-named";
import webpack from "webpack-stream";
import gulpZip from "gulp-zip";

/* Env Variables */
let PRODUCTION, WATCH_MODE;
if (yargs.argv) {
  PRODUCTION = yargs.argv.production;
  WATCH_MODE = yargs.argv.hot;
}

/* Dev Server */
const server = browserSync.create();
const runServer = cb => {
  server.init({ server: DistDir, notify: false, ui: false, logLevel: "silent" });
  cb();
};
const reloadServer = cb => {
  server.reload();
  cb();
};

/* Main Tasks */
const handleScripts = () => {
  return (
    gulp
      .src(Paths.scripts.src)
      .pipe(gulpIf(!PRODUCTION, gulpSourcemaps.init()))
      .pipe(named())
      // webpack
      .pipe(
        webpack({
          mode: PRODUCTION ? "production" : "development",
          module: {
            rules: [
              {
                test: /\.m?js$/,
                use: {
                  loader: "babel-loader",
                  options: {
                    presets: ["@babel/preset-env"],
                  },
                },
              },
              {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
              },
            ],
          },
          output: {
            filename: "[name].js",
          },
          optimization: {
            minimize: PRODUCTION ? true : false,
            minimizer: [
              new TerserPlugin({
                terserOptions: {
                  mangle: false,
                },
              }),
            ],
          },
          resolve: {
            extensions: [".ts", ".js"],
          },
          devtool: !PRODUCTION ? "inline-source-map" : false,
        })
      )
      .pipe(gulpIf(!PRODUCTION, gulpSourcemaps.write()))
      // uglify scripts
      .pipe(gulpIf(PRODUCTION, gulpUglify()))
      .pipe(gulp.dest(Paths.scripts.dest))
  );
};
const handleStyles = () => {
  const compiler = gulpSass(sass);
  return gulp
    .src(Paths.styles.src, { allowEmpty: false })
    .pipe(gulpIf(!PRODUCTION, gulpSourcemaps.init()))
    .pipe(compiler().on("error", compiler.logError))
    .pipe(gulpPostcss())
    .pipe(gulpIf(PRODUCTION, gulpCleanCss({ compatibility: "ie8" })))
    .pipe(gulpIf(!PRODUCTION, gulpSourcemaps.write()))
    .pipe(gulp.dest(Paths.styles.dest))
    .pipe(server.stream());
};
const handleImages = () => {
  return gulp
    .src(Paths.images.src)
    .pipe(gulpIf(PRODUCTION, gulpImagemin({})))
    .pipe(gulp.dest(Paths.images.dest));
};
const copyOtherFiles = () => {
  return gulp.src(Paths.other.src).pipe(gulp.dest(Paths.other.dest));
};
const processAssets = () => gulp.parallel(handleScripts, handleStyles, handleImages, copyOtherFiles);

const cleanOutDir = async cb => {
  await rimraf("./" + DistDir);
  cb();
};
const injectAssets = () => {
  const sources = gulp.src([...Assets.styles.map(path => Paths.styles.dest + "/" + path.replace(/^.*[\\\/]/, "").replace(/\.scss$/, ".css")), ...Assets.scripts.map(path => Paths.scripts.dest + "/" + path.replace(/^.*[\\\/]/, "").replace(/\.ts$/, ".js"))], { read: false });
  return gulp
    .src(`${DistDir}/**/*.html`)
    .pipe(gulpInject(sources, { relative: true, removeTags: true, selfClosingTag: true }))
    .pipe(gulpIf(PRODUCTION, gulpHtmlMin({ collapseWhitespace: true })))
    .pipe(gulp.dest(DistDir));
};
const watch = cb => {
  if (WATCH_MODE && !PRODUCTION) {
    gulp.watch("src/assets/styles/**/*.scss", handleStyles);
    gulp.watch("src/assets/scripts/**/*.{js,ts}", gulp.series(handleScripts, reloadServer));
    gulp.watch(Paths.images.src, gulp.series(handleImages, reloadServer));
    gulp.watch(Paths.other.src, gulp.series(handleStyles, copyOtherFiles, injectAssets, reloadServer));
  } else {
    cb();
  }
};
const compress = () => {
  return gulp
    .src(Paths.dist.src)
    .pipe(gulpZip(`bundle-${Date.now()}.zip`))
    .pipe(gulp.dest(Paths.dist.dest));
};
const mainTask = () => gulp.series(cleanOutDir, processAssets(), injectAssets);

/* Cli Commands */
export const dev = gulp.series(mainTask(), watch);
export const serve = gulp.series(mainTask(), runServer, watch);
export const build = gulp.series(mainTask());
export const zip = gulp.series(build, compress);
