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
var _this = this;
var Handler_1 = require("./Handler");
var events = [
    "issue_comment.edited",
    "pull_request.opened",
    "check_suite.requested",
    "check_suite.rerequested"
];
function getPrs(context) {
    var prs = [];
    if (context.name === "issue_comment" &&
        context.payload.action === "edited") {
        prs = [{ number: context.payload.issue.number }];
    }
    else if (context.name === "pull_request" &&
        context.payload.action === "opened") {
        prs = [context.payload.pull_request];
    }
    else {
        prs = context.payload.check_suite.pull_requests;
    }
    return prs;
}
module.exports = function (app) { return __awaiter(_this, void 0, void 0, function () {
    var router;
    var _this = this;
    return __generator(this, function (_a) {
        app.log("Starting superficial bot");
        app.log("Registering events", events);
        app.on(events, function (context) { return __awaiter(_this, void 0, void 0, function () {
            var prs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prs = getPrs(context);
                        return [4 /*yield*/, Promise.all(prs.map(function (pr) { return __awaiter(_this, void 0, void 0, function () {
                                var handler;
                                return __generator(this, function (_a) {
                                    handler = new Handler_1.Handler(context);
                                    return [2 /*return*/, handler.handle(pr.number)];
                                });
                            }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        router = app.route('/');
        // Use any middleware
        router.use(require('express').static('static'));
        return [2 /*return*/];
    });
}); };
