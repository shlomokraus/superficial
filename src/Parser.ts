const parser = require("@babel/parser");
const jsondiffpatch = require("jsondiffpatch");
const prettier = require("prettier");

export class Parser {
  static parse(src: string, filename: string, prettier = true) {
    if (prettier) {
      src = this.prepare(src, { filepath: filename });
    }
    return parser.parse(src, {
      allowImportExportEverywhere: true,
      sourceType: "unambiguous",
      plugins: [
        "classProperties",
        "jsx",
        "typescript",
        "objectRestSpread",
        "decorators-legacy"
      ]
    });
  }

  static prepare(src: string, options) {
    return prettier.format(src, options);
  }

  static diff(src, target, ignoreKeys: string[] = []) {
    const diff = jsondiffpatch.create({
      propertyFilter: function(name, context) {
        return ignoreKeys.indexOf(name) < 0;
      }
    });
    return diff.diff(src, target);
  }
}
