/* Created by tommyZZM.OSX on 2019/2/15. */
"use strict";
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const browserify = require("browserify");
const watchify = require("watchify");
const babelify = require("babelify");
const log = require("fancy-log");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const alias = require("awesome-aliasify");
const gsass = require("gulp-sass");
const sass = require("node-sass");
const rename = require("gulp-rename");
const streamToPromise = require("stream-to-promise");
const transformCssInlineWithClassNames = require("browserify-transform-css-inline-with-classnames")
const sassPackageImporter = require('node-sass-package-importer');
const sassOnceImporter = require('node-sass-once-importer');
const transformSvgToVue = require('./tools/browserify-transform-svg-to-vue');
const through = require("through2");
const postcssPluginUrl = require("postcss-url")

const babelrc = require("./babelrc");

const aliasrc = {
  "vue": "global.Vue",
  "vue-router": "global.VueRouter",
  "vuex": "global.Vuex",
  "pixi": "global.PIXI",
  "socket.io-client": "global.io",
  "application": "global.__application",
  "vue-monaco": "./vendor/vue-monaco/src/index.js"
};

const b = patchingBrowserify(browserify({
  entries:"./src/index.js",
  standalone:"app",
  debug: true
}))

function _scssReader(_, filename, emitFile) {
  return new Promise((resolve, reject) => {
    sass.render({
      file: filename,
      importer: [
        sassPackageImporter({
          packageKeys: ['sass', 'scss', 'css'],
          packagePrefix: '~'
        }),
        sassOnceImporter(),
        function (url, prev, done) {
          emitFile(url);
          done();
        }
      ]
    }, function (err, result) {
      if (err) return reject(err);
      resolve(result.css);
    });
  });
}

function patchingBrowserify(b) {
  return b.plugin(alias, { ...aliasrc })
    .transform(transformSvgToVue)
    .transform(transformCssInlineWithClassNames, {
      postcssPlugins: [
        postcssPluginUrl({ url: 'inline' })
      ],
      reader: {
        "*.scss": _scssReader
      },
      jsModuleTemplate(css, classNamesMapping, filepath) {
        return `
const cssText = ${JSON.stringify(css)};
const s = document.createElement('style');
s.setAttribute('data-path', ${JSON.stringify(path.relative(__dirname, filepath))});
s.innerHTML = cssText;
document.head.appendChild(s);
const mapping = ${JSON.stringify(classNamesMapping)};
module.exports = function(...args) {
  const [ first ] = args;
  let argClassNames = args;
  if (typeof first === "object") {
    argClassNames = Object.keys(first).filter(key => !!first[key]);
  }
  return argClassNames.reduce(function(result, classNameMaybe) {
    const classNames = classNameMaybe.split(' ');
    return classNames.reduce(function(result, name) {
      return result + (result ? " " : "") + (mapping[name] || "");
    }, result);
  }, "");
};
`.trim()
      }
    })
    .transform(babelify.configure({ extensions: [".js", ".svg"] }), { ...babelrc })
}

function bundle(b) {
  return streamToPromise(
    b.bundle()
      .on('error', function (error) {
        log(error);
        log('current browserify bundle process ends with error...')
        this.emit("end");
      })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      // Add transformation tasks to the pipeline here.
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dist/'))
  )
}

gulp.task("build", _ => {
  return bundle(b);
});

gulp.task("build-watch", gulp.series("build", _ => {
  let bw = watchify(b);
  bw.on("update", (updated_paths) => {
    log("source updated ...", path.relative(__dirname, updated_paths[0]), "etc..");
    bundle(bw);
  });
  bundle(bw);
}));

gulp.task("default", gulp.series("build"));
