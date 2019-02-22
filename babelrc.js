/* Created by tommyZZM.OSX on 2018/7/9. */
"use strict";

module.exports = {
  "presets": [
    [
      "@babel/preset-env", {
        "loose": false,
        "targets": {
          "browsers": ["last 2 versions", "safari >= 10"]
        },
        "exclude": [
          "transform-regenerator",
          "transform-async-to-generator",
          "es6.promise",
          "es6.map",
          "es6.set"
        ]
      }
    ],
    // ["minify",{
    //   builtIns: false,
    // }],
  ],
  "plugins": [
    "transform-vue-jsx",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-export-default-from",
    "@babel/plugin-proposal-object-rest-spread",
    [
      "@babel/plugin-transform-modules-commonjs", {
      "strict": false
    }
    ]
  ]
}
