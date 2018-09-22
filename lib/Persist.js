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
var regex = /\n\n<!-- probot = (.*) -->/;
/**
 * Stores metadata in PR comments, extracted from metadata bot
 * https://github.com/probot/metadata/blob/master/index.js
 */
var Persist = /** @class */ (function () {
    function Persist(context, issue) {
        this.github = context.github;
        this.prefix = context.payload.installation.id;
        this.context = context;
        if (!issue) {
            this.issue = context.issue();
        }
        else {
            this.issue = issue;
        }
    }
    Persist.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var body, match, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = this.issue.body;
                        if (!!body) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.github.issues.get(this.issue)];
                    case 1:
                        body = (_a.sent()).data.body;
                        _a.label = 2;
                    case 2:
                        match = body.match(regex);
                        if (match) {
                            data = JSON.parse(match[1])[this.prefix];
                            return [2 /*return*/, key ? data && data[key] : data];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Persist.prototype.set = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var body, data, _a, owner, repo, number;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        body = this.issue.body;
                        data = {};
                        if (!!body) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.github.issues.get(this.issue)];
                    case 1:
                        body = (_b.sent()).data.body;
                        _b.label = 2;
                    case 2:
                        body = body.replace(regex, function (_, json) {
                            data = JSON.parse(json);
                            return '';
                        });
                        if (!data[this.prefix])
                            data[this.prefix] = {};
                        if (typeof key === 'object') {
                            Object.assign(data[this.prefix], key);
                        }
                        else {
                            data[this.prefix][key] = value;
                        }
                        body = body + "\n\n<!-- probot = " + JSON.stringify(data) + " -->";
                        _a = this.issue, owner = _a.owner, repo = _a.repo, number = _a.number;
                        return [2 /*return*/, this.github.issues.edit({ owner: owner, repo: repo, number: number, body: body })];
                }
            });
        });
    };
    return Persist;
}());
exports.Persist = Persist;
