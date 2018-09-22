"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Parser_1 = require("./Parser");
var file_extension_1 = __importDefault(require("file-extension"));
var Template_1 = require("./Template");
var lodash_1 = require("lodash");
var Github_1 = require("./Github");
var extensions = ["ts", "js", "tsx", "jsx", "json"];
var botIdentifier = "superficial-bot[bot]";
var Handler = /** @class */ (function () {
    function Handler(context) {
        var _this = this;
        this.parseFile = function (file) { return __awaiter(_this, void 0, void 0, function () {
            var valid, error, content, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.getBaseAndHead(file)];
                    case 2:
                        content = _a.sent();
                        // If we don't have base, that is a new file so it is valid
                        valid =
                            content.base && content.head
                                ? this.compareFiles(content.head, content.base, file)
                                : true;
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        this.context.log.error("Unable to parse file", ex_1);
                        error = true;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, { file: file, valid: valid, error: error }];
                }
            });
        }); };
        this.revertFile = function (path) { return __awaiter(_this, void 0, void 0, function () {
            var base, source;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        base = this.pr.base.ref;
                        return [4 /*yield*/, this.githubHelper.getFile(path, base)];
                    case 1:
                        source = _a.sent();
                        return [2 /*return*/, { path: path, content: source.content }];
                }
            });
        }); };
        this.postRevertComment = function (files) { return __awaiter(_this, void 0, void 0, function () {
            var fileItemsTemplate, renderedFiles, commentTemplate, comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Template_1.Template.get(Template_1.Templates.fileItem)];
                    case 1:
                        fileItemsTemplate = _a.sent();
                        renderedFiles = files.map(function (filename) {
                            return lodash_1.template(fileItemsTemplate)({ filename: filename });
                        });
                        return [4 /*yield*/, Template_1.Template.get(Template_1.Templates.revert)];
                    case 2:
                        commentTemplate = _a.sent();
                        comment = lodash_1.template(commentTemplate)({
                            files: renderedFiles.join("\n")
                        });
                        return [4 /*yield*/, this.context.github.issues.createComment(this.context.repo({ number: this.pr.number, body: comment }))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.postComment = function (items, errors) {
            if (errors === void 0) { errors = []; }
            return __awaiter(_this, void 0, void 0, function () {
                var context, files, comment, existing, _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            context = this.context;
                            files = items.map(function (item) { return item.file; });
                            return [4 /*yield*/, this.compileComment(files, errors)];
                        case 1:
                            comment = _f.sent();
                            return [4 /*yield*/, this.getExistingComment()];
                        case 2:
                            existing = _f.sent();
                            if (!existing) return [3 /*break*/, 5];
                            _b = (_a = context.github.issues).editComment;
                            _d = (_c = context).repo;
                            _e = {
                                number: this.pr.number
                            };
                            return [4 /*yield*/, Template_1.Template.get(Template_1.Templates.updated)];
                        case 3: return [4 /*yield*/, _b.apply(_a, [_d.apply(_c, [(_e.body = _f.sent(),
                                        _e.comment_id = String(existing.id),
                                        _e)])])];
                        case 4:
                            _f.sent();
                            return [3 /*break*/, 7];
                        case 5:
                            if (!(files.length > 0)) return [3 /*break*/, 7];
                            return [4 /*yield*/, context.github.issues.createComment(context.repo({ number: this.pr.number, body: comment }))];
                        case 6:
                            _f.sent();
                            _f.label = 7;
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        this.getExistingComment = function () { return __awaiter(_this, void 0, void 0, function () {
            var comments, filtered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.github.issues.getComments(this.context.repo({ number: this.pr.number }))];
                    case 1:
                        comments = _a.sent();
                        filtered = comments.data.find(function (comment) {
                            var isBot = comment.user.login === botIdentifier;
                            if (!isBot) {
                                return false;
                            }
                            var body = comment.body;
                            return body.indexOf("be superficial!") >= 0;
                        });
                        return [2 /*return*/, filtered];
                }
            });
        }); };
        this.updateStatus = function (success) { return __awaiter(_this, void 0, void 0, function () {
            function getDescription() {
                if (success)
                    return "ready to merge";
                return "superficial changes not allowed";
            }
            var head, state, status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        head = this.pr.head;
                        state = success ? "success" : "failure";
                        status = {
                            sha: head.sha,
                            state: state,
                            description: getDescription(),
                            context: "Superficial"
                        };
                        return [4 /*yield*/, this.context.github.repos.createStatus(this.context.repo(status))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.getBaseAndHead = function (path) { return __awaiter(_this, void 0, void 0, function () {
            var head, base, headRef, baseRef, ex_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        headRef = this.pr.head.ref;
                        return [4 /*yield*/, this.githubHelper.getFileContent(path, headRef)];
                    case 1:
                        head = _a.sent();
                        baseRef = this.pr.base.ref;
                        return [4 /*yield*/, this.githubHelper.getFileContent(path, baseRef)];
                    case 2:
                        base = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        ex_2 = _a.sent();
                        ex_2 = ex_2;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, { head: head, base: base }];
                }
            });
        }); };
        this.context = context;
    }
    Handler.prototype.handle = function (prNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var isComment, shouldRevert, pr, _a, problematic, errors, revertPaths, revert;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        isComment = this.context.payload.comment;
                        return [4 /*yield*/, this.checkComment()];
                    case 1:
                        shouldRevert = _b.sent();
                        // If it is a comment but not a revert request, we got nothing to do here
                        if (isComment && !shouldRevert) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.context.github.pullRequests.get(this.context.repo({ number: prNumber }))];
                    case 2:
                        pr = _b.sent();
                        this.pr = pr.data;
                        // Initialize Helper
                        this.githubHelper = new Github_1.GithubHelper(this.context, this.pr);
                        return [4 /*yield*/, this.check()];
                    case 3:
                        _a = _b.sent(), problematic = _a.problematic, errors = _a.errors;
                        if (!!shouldRevert) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.updateStatus(problematic.length === 0)];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.postComment(problematic, errors)];
                    case 5:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 6:
                        revertPaths = problematic.map(function (item) { return item.file; });
                        return [4 /*yield*/, Promise.all(revertPaths.map(function (path) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.revertFile(path)];
                            }); }); }))];
                    case 7:
                        revert = _b.sent();
                        if (!(revert.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.githubHelper.createCommit(revert)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.postRevertComment(revert.map(function (file) { return file.path; }))];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Handler.prototype.checkComment = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context, changes, before, after, beforeCheck, afterCheck;
            return __generator(this, function (_a) {
                context = this.context;
                if (!this.context.payload.comment) {
                    return [2 /*return*/, false];
                }
                if (this.context.payload.comment.user.login !== botIdentifier) {
                    return [2 /*return*/, false];
                }
                changes = context.payload.changes.body;
                if (!changes) {
                    return [2 /*return*/, false];
                }
                before = changes.from;
                after = context.payload.comment.body;
                beforeCheck = before.indexOf("- [ ] Remove selected files") >= 0;
                afterCheck = after.indexOf("- [x] Remove selected files") >= 0;
                return [2 /*return*/, beforeCheck && afterCheck];
            });
        });
    };
    Handler.prototype.check = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, results, problematic, errors;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.githubHelper.getFiles()];
                    case 1:
                        files = _a.sent();
                        files = this.filterFiles(files);
                        return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.parseFile(file)];
                            }); }); }))];
                    case 2:
                        results = _a.sent();
                        problematic = results.filter(function (result) { return !result.valid; });
                        errors = results.filter(function (result) { return result.error; });
                        return [2 /*return*/, { problematic: problematic, errors: errors }];
                }
            });
        });
    };
    Handler.prototype.compileComment = function (files, errors) {
        return __awaiter(this, void 0, void 0, function () {
            var fileItemsTemplate, renderedFiles, commentTemplate, comment, errorCount, errTemplate, errDoc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Template_1.Template.get(Template_1.Templates.fileItem)];
                    case 1:
                        fileItemsTemplate = _a.sent();
                        renderedFiles = files.map(function (filename) {
                            return lodash_1.template(fileItemsTemplate)({ filename: filename });
                        });
                        return [4 /*yield*/, Template_1.Template.get(Template_1.Templates.comment)];
                    case 2:
                        commentTemplate = _a.sent();
                        comment = lodash_1.template(commentTemplate)({
                            files: renderedFiles.join("\n")
                        });
                        errorCount = errors.length;
                        if (!(errorCount > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, Template_1.Template.get(Template_1.Templates.errors)];
                    case 3:
                        errTemplate = _a.sent();
                        errDoc = lodash_1.template(errTemplate)({ errors: errorCount });
                        comment = comment + "\n" + errDoc;
                        _a.label = 4;
                    case 4: return [2 /*return*/, comment];
                }
            });
        });
    };
    Handler.prototype.compareFiles = function (source, target, filename) {
        var left = Parser_1.Parser.parse(source, filename);
        var right = Parser_1.Parser.parse(target, filename);
        var diff = Parser_1.Parser.diff(left, right, ["loc", "start", "end"]);
        return diff !== undefined;
    };
    Handler.prototype.filterFiles = function (files) {
        return files.filter(function (file) {
            var ext = file_extension_1.default(file);
            return extensions.indexOf(ext) >= 0;
        });
    };
    return Handler;
}());
exports.Handler = Handler;
