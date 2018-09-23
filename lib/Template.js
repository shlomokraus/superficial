"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var Templates;
(function (Templates) {
    Templates["comment"] = "comment.md";
    Templates["updated"] = "updated.md";
    Templates["revert"] = "revert.md";
    Templates["fileItem"] = "file-item.md";
    Templates["errors"] = "errors.md";
})(Templates = exports.Templates || (exports.Templates = {}));
var Template = /** @class */ (function () {
    function Template() {
    }
    Template.get = function (template) {
        var file = path_1.default.resolve("./src/templates/" + template);
        var str = fs_1.default.readFileSync(file, "utf8");
        return str;
    };
    return Template;
}());
exports.Template = Template;
