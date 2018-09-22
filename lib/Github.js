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
var Github = /** @class */ (function () {
    function Github(context, pr) {
        var _this = this;
        this.createCommit = function (files) { return __awaiter(_this, void 0, void 0, function () {
            var context, github, issue, pr, ref, basetree, blobDict, tree, newTree, commit;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        context = this.context;
                        github = context.github;
                        issue = context.repo({ number: this.pr.number });
                        return [4 /*yield*/, github.pullRequests.get(issue)];
                    case 1:
                        pr = _a.sent();
                        return [4 /*yield*/, github.gitdata.getReference(context.repo({ ref: "heads/" + pr.data.head.ref }))];
                    case 2:
                        ref = _a.sent();
                        return [4 /*yield*/, github.gitdata.getTree(context.repo({ tree_sha: ref.data.object.sha }))];
                    case 3:
                        basetree = _a.sent();
                        blobDict = {};
                        return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                                var blob;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, github.gitdata.createBlob(context.repo({
                                                number: this.pr.number,
                                                content: file.content,
                                                encoding: 'base64'
                                            }))];
                                        case 1:
                                            blob = _a.sent();
                                            blobDict[file.path] = blob.data.sha;
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 4:
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
                                base_tree: basetree.data.sha,
                                tree: tree
                            }))];
                    case 5:
                        newTree = _a.sent();
                        return [4 /*yield*/, github.gitdata.createCommit(context.repo({ message: "Removing files that only have style changes", tree: newTree.data.sha, parents: [basetree.data.sha] }))];
                    case 6:
                        commit = _a.sent();
                        return [4 /*yield*/, github.gitdata.updateReference(context.repo({ number: this.pr.number, sha: commit.data.sha, ref: "heads/" + pr.data.head.ref }))];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.context = context;
        this.pr = pr;
    }
    return Github;
}());
exports.Github = Github;
