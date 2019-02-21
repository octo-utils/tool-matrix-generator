/* Created by tommyZZM.OSX on 2019/2/15. */
"use strict";
const through = require("through2")
const minimatch = require("minimatch")
const cheerio = require('cheerio')

module.exports = function (filename, _) {

  const isSvg = minimatch(filename, '*.svg', { matchBase: true });

  if (!isSvg) return through();

  let merged = Buffer.from("");

  return through((buf, _, next) => {
    // let bufString = buf.toString();
    merged = Buffer.concat([merged, buf]);
    next(null);
  }, function (flush) {
    const bufString = merged.toString();
    const $ = cheerio.load(bufString, {xmlMode: true})
    const $svg = $('svg');
    $svg.attr('width', '1em').attr('height', '1em');
    this.push(Buffer.from(`
export default {
  render() {
    return ${$.html()};
  }
}`.trim()));
    flush();
  })
}
