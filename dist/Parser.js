"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parser = require("@babel/parser");
var jsondiffpatch = require("jsondiffpatch");
var prettier = require("prettier");
var json_pointer_1 = __importDefault(require("json-pointer"));
var Parser = /** @class */ (function () {
    function Parser() {
    }
    Parser.parse = function (src, filename, prettier) {
        if (prettier === void 0) { prettier = true; }
        if (prettier) {
            src = this.prepare(src, { filepath: filename });
        }
        return parser.parse(src, {
            plugins: ["classProperties", "jsx", "typescript"]
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
    Parser.flatten = function (obj) {
        return json_pointer_1.default.dict(obj, null);
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map