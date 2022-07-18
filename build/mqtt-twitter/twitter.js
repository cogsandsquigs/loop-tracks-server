"use strict";
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Twitter = void 0;
var twitter_api_sdk_1 = require("twitter-api-sdk");
var logger_1 = require("../logger");
var mqtt_1 = __importDefault(require("mqtt"));
var Twitter = /** @class */ (function () {
    function Twitter(bearerToken, streamingRules, mqttServer, topic) {
        var _this = this;
        this.start = function () { return __awaiter(_this, void 0, void 0, function () {
            var currentRules_1, stream, stream_1, stream_1_1, tweet, e_1_1, error_1;
            var _this = this;
            var e_1, _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 19, , 20]);
                        return [4 /*yield*/, this.client.tweets.getRules()];
                    case 1:
                        currentRules_1 = _c.sent();
                        logger_1.Logger.info("Twitter streaming rules: ".concat((currentRules_1.data || [])
                            .map(function (rule) { return "".concat(rule.tag || rule.value); })
                            .join(", ")));
                        if (!(currentRules_1.data !== undefined &&
                            currentRules_1.data.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.client.tweets.addOrDeleteRules({
                                delete: {
                                    ids: currentRules_1.data.map(function (rule) { return rule.id; }),
                                },
                            })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        if (!(currentRules_1.data === undefined ||
                            this.streamingRules.filter(function (rule) {
                                return !currentRules_1.data.find(function (r) { return r.value === rule.value; });
                            }).length > 0)) return [3 /*break*/, 5];
                        logger_1.Logger.info("Adding streaming rules...");
                        return [4 /*yield*/, this.client.tweets.addOrDeleteRules({
                                add: this.streamingRules.filter(function (rule) {
                                    return !(currentRules_1.data || []).find(function (r) { return r.value === rule.value; });
                                }),
                            })];
                    case 4:
                        _c.sent();
                        logger_1.Logger.info("Twitter streaming rules updated: ".concat(this.streamingRules
                            .map(function (rule) { return "".concat(rule.tag || rule.value); })
                            .join(", ")));
                        _c.label = 5;
                    case 5:
                        logger_1.Logger.info("Streaming rules up to date.");
                        return [4 /*yield*/, this.client.tweets.searchStream()];
                    case 6:
                        stream = _c.sent();
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 12, 13, 18]);
                        stream_1 = __asyncValues(stream);
                        _c.label = 8;
                    case 8: return [4 /*yield*/, stream_1.next()];
                    case 9:
                        if (!(stream_1_1 = _c.sent(), !stream_1_1.done)) return [3 /*break*/, 11];
                        tweet = stream_1_1.value;
                        logger_1.Logger.info("Recieved a tweet: \"".concat((_b = tweet.data) === null || _b === void 0 ? void 0 : _b.text, "\""));
                        this.mqtt.publish(this.topic, JSON.stringify(tweet.data), { qos: 2 }, function (err) {
                            if (err) {
                                logger_1.Logger.error("Error publishing to MQTT topic ".concat(_this.topic, ": ").concat(err));
                            }
                        });
                        logger_1.Logger.info("Tweet published to MQTT topic ".concat(this.topic));
                        _c.label = 10;
                    case 10: return [3 /*break*/, 8];
                    case 11: return [3 /*break*/, 18];
                    case 12:
                        e_1_1 = _c.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 18];
                    case 13:
                        _c.trys.push([13, , 16, 17]);
                        if (!(stream_1_1 && !stream_1_1.done && (_a = stream_1.return))) return [3 /*break*/, 15];
                        return [4 /*yield*/, _a.call(stream_1)];
                    case 14:
                        _c.sent();
                        _c.label = 15;
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 17: return [7 /*endfinally*/];
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_1 = _c.sent();
                        logger_1.Logger.error(error_1.stack);
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        }); };
        this.client = new twitter_api_sdk_1.Client(bearerToken);
        this.streamingRules = streamingRules;
        this.mqtt = mqtt_1.default.connect(mqttServer);
        this.topic = topic;
        this.mqtt.on("connect", function () {
            logger_1.Logger.info("Connected to MQTT server ".concat(mqttServer));
            _this.mqtt.subscribe(_this.topic, { qos: 2 }, function (err) {
                if (err) {
                    logger_1.Logger.error("Error subscribing to topic ".concat(topic, ": ").concat(err.stack));
                }
                else {
                    logger_1.Logger.info("Subscribed to MQTT topic ".concat(topic));
                }
            });
        });
        this.mqtt.on("message", function (topic, message) {
            // message is Buffer
            logger_1.Logger.info("Recieved mqtt message on topic ".concat(topic, ": ").concat(message.toString()));
        });
    }
    return Twitter;
}());
exports.Twitter = Twitter;
