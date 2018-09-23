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
var Persist_1 = require("./Persist");
var Constants_1 = require("./Constants");
var Handler = /** @class */ (function () {
    function Handler(context, pr) {
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
                        // If we don't have base or head then the file changes are real
                        valid =
                            content.base && content.head
                                ? this.compareFiles(content.head, content.base, file)
                                : true;
                        return [3 /*break*/, 4];
                    case 3:
                        ex_1 = _a.sent();
                        this.logger.error("Unable to parse file", ex_1);
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
                    case 0:
                        fileItemsTemplate = Template_1.Template.get(Template_1.Templates.fileItem);
                        renderedFiles = files.map(function (filename) {
                            return lodash_1.template(fileItemsTemplate)({ filename: filename });
                        });
                        commentTemplate = Template_1.Template.get(Template_1.Templates.revert);
                        comment = lodash_1.template(commentTemplate)({
                            files: renderedFiles.join("\n")
                        });
                        comment = this.tagComment(comment, Constants_1.CommentTags.Update);
                        return [4 /*yield*/, this.githubHelper.createComment(comment)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.postComment = function (items, errors) {
            if (errors === void 0) { errors = []; }
            return __awaiter(_this, void 0, void 0, function () {
                var files, comment, existing;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            files = items.map(function (item) { return item.file; });
                            return [4 /*yield*/, this.compileComment(files, errors)];
                        case 1:
                            comment = _a.sent();
                            return [4 /*yield*/, this.getBotMainComment()];
                        case 2:
                            existing = _a.sent();
                            if (!existing) return [3 /*break*/, 4];
                            if (files.length === 0) {
                                comment = this.tagComment(Template_1.Template.get(Template_1.Templates.updated), Constants_1.CommentTags.Main);
                            }
                            return [4 /*yield*/, this.githubHelper.editComment(comment, String(existing.id))];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            if (!(files.length > 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.githubHelper.createComment(comment)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        this.getBotMainComment = function () { return __awaiter(_this, void 0, void 0, function () {
            var comments, filtered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.githubHelper.getComments()];
                    case 1:
                        comments = _a.sent();
                        filtered = comments.find(function (comment) {
                            var isBot = comment.user.login === Constants_1.BOT_IDENTIFIER;
                            if (!isBot) {
                                return false;
                            }
                            var body = comment.body;
                            return body.indexOf(Constants_1.CommentTags.Main) >= 0;
                        });
                        return [2 /*return*/, filtered];
                }
            });
        }); };
        this.updateStatus = function (success) { return __awaiter(_this, void 0, void 0, function () {
            var state, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = success ? "success" : "failure";
                        this.logger.info("Updating status to " + state);
                        message = success
                            ? "ready to merge"
                            : "superficial changes not allowed";
                        return [4 /*yield*/, this.githubHelper.createStatus(state, message)];
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
        this.logger = context.log;
        this.pr = pr;
        this.githubHelper = new Github_1.GithubHelper(this.context, pr);
        this.persist = new Persist_1.Persist(this.context, this.context.repo({ number: pr.number }));
    }
    /**
     * Main entry point
     */
    Handler.prototype.handle = function () {
        return __awaiter(this, void 0, void 0, function () {
            var event;
            return __generator(this, function (_a) {
                event = this.context.name ? this.context.name : this.context.event;
                this.logger.info("Handling action " + this.context.name);
                if (event === "issue_comment" &&
                    this.context.payload.action === "edited") {
                    return [2 /*return*/, this.handleCommentEdit()];
                }
                else {
                    return [2 /*return*/, this.handleCheckStatus()];
                }
                return [2 /*return*/];
            });
        });
    };
    Handler.prototype.handleCommentEdit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shouldRevert, files, revertPaths, revert;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkComment()];
                    case 1:
                        shouldRevert = _a.sent();
                        if (!this.context.payload.comment && !shouldRevert) {
                            this.logger.info("Comment is not a revert request");
                            return [2 /*return*/];
                        }
                        this.logger.debug("Reverting files");
                        return [4 /*yield*/, this.persist.get("files")];
                    case 2:
                        files = (_a.sent());
                        if (!files) {
                            this.logger.info("No files in metada: ", files);
                        }
                        this.logger.debug("Got files from metadata: ", files);
                        try {
                            files = JSON.parse(files);
                        }
                        catch (ex) {
                            this.logger.error("Error while parsing files to json", ex);
                        }
                        revertPaths = files.map(function (item) { return item.file; });
                        return [4 /*yield*/, Promise.all(revertPaths.map(function (path) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.revertFile(path)];
                            }); }); }))];
                    case 3:
                        revert = _a.sent();
                        if (!(revert.length > 0)) return [3 /*break*/, 7];
                        this.logger.debug("Creating commit");
                        return [4 /*yield*/, this.githubHelper.createCommit(revert)];
                    case 4:
                        _a.sent();
                        this.logger.debug("Posting rever comment");
                        return [4 /*yield*/, this.postRevertComment(revert.map(function (file) { return file.path; }))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.persist.set("files", undefined)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    Handler.prototype.handleCheckStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, problematic, errors, payload;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.debug("Starting check run");
                        return [4 /*yield*/, this.check()];
                    case 1:
                        _a = _b.sent(), problematic = _a.problematic, errors = _a.errors;
                        this.logger.debug("Check completed with " +
                            problematic.length +
                            " files and " +
                            errors.length +
                            " errors");
                        this.logger.info("Updating pr status");
                        return [4 /*yield*/, this.updateStatus(problematic.length === 0)];
                    case 2:
                        _b.sent();
                        this.logger.info("Posting comment");
                        return [4 /*yield*/, this.postComment(problematic, errors)];
                    case 3:
                        _b.sent();
                        if (!(problematic.length > 0)) return [3 /*break*/, 5];
                        payload = JSON.stringify(problematic);
                        this.logger.info("Storing metadata", payload);
                        return [4 /*yield*/, this.persist.set("files", payload)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Handler.prototype.checkComment = function () {
        return __awaiter(this, void 0, void 0, function () {
            var context, changes, before, after, beforeCheck, afterCheck;
            return __generator(this, function (_a) {
                this.logger.info("Checking comment...");
                context = this.context;
                if (!this.context.payload.comment) {
                    this.logger.debug("No comment payload");
                    return [2 /*return*/, false];
                }
                if (this.context.payload.comment.user.login !== Constants_1.BOT_IDENTIFIER) {
                    this.logger.debug("Comment is not owned by bot");
                    return [2 /*return*/, false];
                }
                changes = context.payload.changes.body;
                if (!changes) {
                    this.logger.debug("No changes to comment body");
                    return [2 /*return*/, false];
                }
                before = changes.from;
                after = context.payload.comment.body;
                beforeCheck = before.indexOf("- [x] Remove selected files") < 0;
                afterCheck = after.indexOf("- [x] Remove selected files") >= 0;
                this.logger.debug("Before and after check:", beforeCheck, afterCheck);
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
                    case 0:
                        this.logger.info("Getting files");
                        return [4 /*yield*/, this.githubHelper.getFiles()];
                    case 1:
                        files = _a.sent();
                        this.logger.info("Got " + files.length + " in pull request");
                        this.logger.debug(JSON.stringify(files));
                        files = this.filterFiles(files);
                        this.logger.info("Got " + files.length + " relevant files after filter");
                        return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, this.parseFile(file)];
                            }); }); }))];
                    case 2:
                        results = _a.sent();
                        this.logger.info("Finished parsing files, preparing results");
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
                fileItemsTemplate = Template_1.Template.get(Template_1.Templates.fileItem);
                renderedFiles = files.map(function (filename) {
                    return lodash_1.template(fileItemsTemplate)({ filename: filename });
                });
                commentTemplate = Template_1.Template.get(Template_1.Templates.comment);
                comment = lodash_1.template(commentTemplate)({
                    files: renderedFiles.join("\n")
                });
                errorCount = errors.length;
                if (errorCount > 0) {
                    errTemplate = Template_1.Template.get(Template_1.Templates.errors);
                    errDoc = lodash_1.template(errTemplate)({ errors: errorCount });
                    comment = comment + "\n" + errDoc;
                }
                return [2 /*return*/, this.tagComment(comment, Constants_1.CommentTags.Main)];
            });
        });
    };
    Handler.prototype.compareFiles = function (source, target, filename) {
        this.logger.info("Comparing file " + filename);
        var ext = file_extension_1.default(filename);
        var isScript = Constants_1.SCRIPT_EXTENSIONS.indexOf(ext) >= 0;
        var left = isScript
            ? Parser_1.Parser.parse(source, filename)
            : Parser_1.Parser.prepare(source, { filepath: filename });
        var right = isScript
            ? Parser_1.Parser.parse(target, filename)
            : Parser_1.Parser.prepare(target, { filepath: filename });
        var diff = Parser_1.Parser.diff(left, right, ["loc", "start", "end"]);
        this.logger.debug("Result is ", diff);
        return diff !== undefined;
    };
    Handler.prototype.filterFiles = function (files) {
        return files.filter(function (file) {
            var ext = file_extension_1.default(file);
            return Constants_1.VALID_EXTENSIONS.indexOf(ext) >= 0;
        });
    };
    /**
     * Tag comment with metadata
     */
    Handler.prototype.tagComment = function (body, commentTag) {
        if (body.indexOf(commentTag) < 0) {
            return body + "\n" + commentTag;
        }
        return body;
    };
    return Handler;
}());
exports.Handler = Handler;
