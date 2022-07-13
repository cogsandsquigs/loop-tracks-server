"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
exports.Server = void 0;
var toad_scheduler_1 = require("toad-scheduler");
var express_1 = __importStar(require("express"));
var logger_1 = require("../logger");
var cta_1 = require("./cta");
var train_1 = require("./train");
var mbta_1 = require("./mbta");
var Server = /** @class */ (function () {
    function Server(backgroundCacheUpdateSeconds, apiKeys) {
        var _this = this;
        this.sources = [];
        this.router = (0, express_1.Router)();
        this.scheduler = new toad_scheduler_1.ToadScheduler();
        this.cache = new Map();
        this.sourceConstructors = [cta_1.CTA, mbta_1.MBTA];
        var _loop_1 = function (sourceConstructor) {
            var apiKey = Object.entries(apiKeys).find(function (_a) {
                var key = _a[0];
                return key.toLowerCase() == sourceConstructor.name.toLowerCase();
            });
            if (apiKey && apiKey[1] !== "") {
                this_1.sources.push(new sourceConstructor(apiKey[1]));
            }
            else {
                logger_1.Logger.warn("No API key found for the ".concat(sourceConstructor.name, " rail system. Is this intentional, or do you mean to add one?"));
                this_1.sources.push(new sourceConstructor(""));
            }
        };
        var this_1 = this;
        // assings sources to the server for updating data cache
        for (var _i = 0, _a = this.sourceConstructors; _i < _a.length; _i++) {
            var sourceConstructor = _a[_i];
            _loop_1(sourceConstructor);
        }
        // creates a new task update the cache in the background
        var task = new toad_scheduler_1.AsyncTask("Update train data cache in background", 
        // updates cache with data from all sources
        function () { return __awaiter(_this, void 0, void 0, function () {
            var _i, _a, source, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logger_1.Logger.info("Updating train data cache...");
                        _i = 0, _a = this.sources;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        source = _a[_i];
                        return [4 /*yield*/, source.getData()];
                    case 2:
                        data = _b.sent();
                        this.cache.set(source.name, data);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        logger_1.Logger.info("Train data cache updated!");
                        return [2 /*return*/];
                }
            });
        }); }, function (err) {
            logger_1.Logger.error("Error while updating data: ".concat(err.message, "\n").concat(err.stack));
        });
        // creates a new job that runs the task every n seconds
        var job = new toad_scheduler_1.SimpleIntervalJob({ seconds: backgroundCacheUpdateSeconds, runImmediately: true }, task);
        this.scheduler.addSimpleIntervalJob(job);
        // DEPRECIATED: use /system/:system instead
        this.router.get("/:system", this.trainSystemHandler.bind(this));
        // Gets train data for a given transportation system
        this.router.get("/system/:system", this.trainSystemHandler.bind(this));
    }
    Server.prototype.listen = function (port) {
        var app = (0, express_1.default)();
        app.use("/", this.router);
        app.listen(port, function () {
            logger_1.Logger.info("App is listening on port ".concat(port));
        });
    };
    Server.prototype.trainSystemHandler = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var system, lines, c, _loop_2, _i, lines_1, line, state_1, data;
            return __generator(this, function (_a) {
                system = req.params.system.toLowerCase();
                lines = String(req.query.lines).split(",");
                res.removeHeader("Transfer-Encoding");
                res.set("Connection", "close");
                res.removeHeader("Keep-Alive");
                if (lines[0] === undefined || lines[0] === "") {
                    res.status(400).send({ error: "No lines specified" });
                    return [2 /*return*/];
                }
                try {
                    c = this.cache.get(system);
                    if (c === undefined) {
                        res.status(400).send({
                            error: "Unknown transportation/railway system",
                        });
                    }
                    else {
                        _loop_2 = function (line) {
                            if (c.lines.find(function (l) { return l.name == line; }) === undefined) {
                                res.status(400).send({
                                    error: "Line ".concat(line, " does not exist for ").concat(system),
                                });
                                return { value: void 0 };
                            }
                        };
                        // returns an error if any line requested does not exist for the given system
                        for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                            line = lines_1[_i];
                            state_1 = _loop_2(line);
                            if (typeof state_1 === "object")
                                return [2 /*return*/, state_1.value];
                        }
                        data = new train_1.TrainData(c.timestamp, c.system, c.lines.filter(function (l) { return lines.includes(l.name); }));
                        res.status(200).send(data);
                    }
                }
                catch (err) {
                    console.log(err);
                    res.status(500).send({ error: String(err) });
                }
                return [2 /*return*/];
            });
        });
    };
    return Server;
}());
exports.Server = Server;
