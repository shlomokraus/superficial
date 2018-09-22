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
Object.defineProperty(exports, "__esModule", { value: true });
var GithubHelper = /** @class */ (function () {
    function GithubHelper(context, pr) {
        var _this = this;
        this.getFileContent = function (path, ref) { return __awaiter(_this, void 0, void 0, function () {
            var result, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFile(path, ref)];
                    case 1:
                        result = _a.sent();
                        content = Buffer.from(result.content, "base64").toString();
                        return [2 /*return*/, content];
                }
            });
        }); };
        this.getFile = function (path, ref) { return __awaiter(_this, void 0, void 0, function () {
            var repo, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        repo = this.context.repo({ path: path, ref: ref });
                        return [4 /*yield*/, this.context.github.repos.getContent(repo)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                }
            });
        }); };
        this.getFiles = function () { return __awaiter(_this, void 0, void 0, function () {
            var filesRaw, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.github.pullRequests.getFiles(this.context.repo({ number: this.pr.number }))];
                    case 1:
                        filesRaw = _a.sent();
                        files = filesRaw.data.map(function (file) { return file.filename; });
                        return [2 /*return*/, files];
                }
            });
        }); };
        this.getRef = function () { return __awaiter(_this, void 0, void 0, function () {
            var ref;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.github.gitdata.getReference(this.context.repo({ ref: "heads/" + this.pr.head.ref }))];
                    case 1:
                        ref = _a.sent();
                        return [2 /*return*/, ref.data];
                }
            });
        }); };
        this.getTree = function () { return __awaiter(_this, void 0, void 0, function () {
            var ref, tree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRef()];
                    case 1:
                        ref = _a.sent();
                        return [4 /*yield*/, this.context.github.gitdata.getTree(this.context.repo({ tree_sha: ref.object.sha }))];
                    case 2:
                        tree = _a.sent();
                        return [2 /*return*/, tree.data];
                }
            });
        }); };
        this.createBlob = function (content) { return __awaiter(_this, void 0, void 0, function () {
            var blob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.github.gitdata.createBlob(this.context.repo({
                            number: this.pr.number,
                            content: content,
                            encoding: 'base64'
                        }))];
                    case 1:
                        blob = _a.sent();
                        return [2 /*return*/, blob.data];
                }
            });
        }); };
        this.createCommit = function (files) { return __awaiter(_this, void 0, void 0, function () {
            var context, github, basetree, blobDict, tree, newTree, commit;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.context;
                        github = context.github;
                        return [4 /*yield*/, this.getTree()];
                    case 1:
                        basetree = _a.sent();
                        blobDict = {};
                        return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var blob;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.createBlob(file.content)];
                                        case 1:
                                            blob = _a.sent();
                                            blobDict[file.path] = blob.sha;
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 2:
                        _a.sent();
                        tree = files.map(function (file, index) {
                            return {
                                path: file.path,
                                mode: "100644",
                                type: 'blob',
                                sha: blobDict[file.path]
                            };
                        });
                        return [4 /*yield*/, github.gitdata.createTree(context.repo({
                                base_tree: basetree.sha,
                                tree: tree
                            }))];
                    case 3:
                        newTree = _a.sent();
                        return [4 /*yield*/, github.gitdata.createCommit(context.repo({ message: "Removing files that only have style changes", tree: newTree.data.sha, parents: [basetree.sha] }))];
                    case 4:
                        commit = _a.sent();
                        return [4 /*yield*/, github.gitdata.updateReference(context.repo({ number: this.pr.number, sha: commit.data.sha, ref: "heads/" + this.pr.head.ref }))];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.context = context;
        this.pr = pr;
    }
    return GithubHelper;
}());
exports.GithubHelper = GithubHelper;
