"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = require("@babel/parser");
var jsondiffpatch = require("jsondiffpatch");
var prettier = require("prettier");
var Parser = /** @class */ (function () {
    function Parser() {
    }
    Parser.parse = function (src, filename, prettier) {
        if (prettier === void 0) { prettier = true; }
        if (prettier) {
            src = this.prepare(src, { filepath: filename });
        }
        return parser.parse(src, {
            allowImportExportEverywhere: true,
            sourceType: "unambiguous",
            plugins: ["classProperties", "jsx", "typescript", "objectRestSpread", "decorators-legacy"]
        });
    };
    Parser.prepare = function (src, options) {
        return prettier.format(src, options);
    };
    Parser.diff = function (src, target, ignoreKeys) {
        if (ignoreKeys === void 0) { ignoreKeys = []; }
        var diff = jsondiffpatch.create({
            propertyFilter: function (name, context) {
                return ignoreKeys.indexOf(name) < 0;
            },
            objectHash: function (obj) {
                // this function is used only to when objects are not equal by ref
                if (obj.type === "ClassProperty") {
                    console.log(obj);
                    return "ClassProperty" + obj.key.name;
                }
                return null;
            },
        });
        return diff.diff(src, target);
    };
    return Parser;
}());
exports.Parser = Parser;
