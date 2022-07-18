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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Twitter = void 0;
var twitter_api_v2_1 = __importStar(require("twitter-api-v2"));
var logger_1 = require("../logger");
var mqtt_1 = __importDefault(require("mqtt"));
var Twitter = /** @class */ (function () {
    function Twitter(bearerToken, streamingRules, mqttServer, topic) {
        var _this = this;
        this.start = function () { return __awaiter(_this, void 0, void 0, function () {
            var currentRules_1, _a, _b, _c, _d, _e, _f, stream, error_1;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, this.client.v2.streamRules()];
                    case 1:
                        currentRules_1 = _g.sent();
                        _b = (_a = logger_1.Logger).info;
                        _c = "Twitter streaming rules: ".concat;
                        return [4 /*yield*/, this.client.v2.streamRules()];
                    case 2:
                        _b.apply(_a, [_c.apply("Twitter streaming rules: ", [((_g.sent()).data || [])
                                    .map(function (rule) { return "".concat(rule.id, ": ").concat(rule.tag); })
                                    .join(", ")])]);
                        if (!(currentRules_1.data !== undefined &&
                            currentRules_1.data.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.client.v2.updateStreamRules({
                                delete: {
                                    ids: currentRules_1.data.map(function (rule) { return rule.id; }),
                                },
                            })];
                    case 3:
                        _g.sent();
                        _g.label = 4;
                    case 4:
                        if (!(currentRules_1.data === undefined ||
                            this.streamingRules.filter(function (rule) {
                                return !currentRules_1.data.find(function (r) { return r.value === rule.value; });
                            }).length > 0)) return [3 /*break*/, 7];
                        logger_1.Logger.info("Adding streaming rules...");
                        return [4 /*yield*/, this.client.v2.updateStreamRules({
                                add: this.streamingRules.filter(function (rule) {
                                    return !(currentRules_1.data || []).find(function (r) { return r.value === rule.value; });
                                }),
                            })];
                    case 5:
                        _g.sent();
                        _e = (_d = logger_1.Logger).info;
                        _f = "Twitter streaming rules updated: ".concat;
                        return [4 /*yield*/, this.client.v2.streamRules()];
                    case 6:
                        _e.apply(_d, [_f.apply("Twitter streaming rules updated: ", [(_g.sent()).data
                                    .map(function (rule) { return "".concat(rule.id, ": ").concat(rule.tag); })
                                    .join(", ")])]);
                        _g.label = 7;
                    case 7:
                        logger_1.Logger.info("Streaming rules up to date.");
                        return [4 /*yield*/, this.client.v2.searchStream({
                                autoConnect: true,
                            })];
                    case 8:
                        stream = _g.sent();
                        stream.on(
                        // Emitted when the stream is connected.
                        twitter_api_v2_1.ETwitterStreamEvent.Connected, function () {
                            logger_1.Logger.info("Connected to Twitter tweet stream.");
                        });
                        stream.on(
                        // Emitted when Node.js {response} emits a 'error' event (contains its payload).
                        twitter_api_v2_1.ETwitterStreamEvent.ConnectionError, function (err) { return logger_1.Logger.error("Twitter stream connection error: ".concat(err)); });
                        stream.on(
                        // Emitted when the stream connection is lost.
                        twitter_api_v2_1.ETwitterStreamEvent.ConnectionLost, function () {
                            logger_1.Logger.error("Connection to Twitter tweet stream lost.");
                        });
                        stream.on(
                        // Emitted when Node.js {response} is closed by remote or using .close().
                        twitter_api_v2_1.ETwitterStreamEvent.ConnectionClosed, function () { return logger_1.Logger.warn("Connection has been closed."); });
                        stream.on(
                        // Emitted when a Twitter payload (a tweet or not, given the endpoint).
                        twitter_api_v2_1.ETwitterStreamEvent.Data, function (eventData) {
                            try {
                                logger_1.Logger.info("Recieved a tweet: \"".concat(eventData.data.text, "\""));
                                _this.mqtt.publish(_this.topic, JSON.stringify(eventData.data), { qos: 2 }, function (err) {
                                    if (err) {
                                        logger_1.Logger.error("Error publishing to MQTT topic ".concat(_this.topic, ": ").concat(err));
                                    }
                                });
                                logger_1.Logger.info("Tweet published to MQTT topic ".concat(_this.topic));
                            }
                            catch (error) {
                                logger_1.Logger.error(error.stack);
                            }
                        });
                        stream.on(
                        // Emitted when a Twitter sent a signal to maintain connection active
                        twitter_api_v2_1.ETwitterStreamEvent.DataKeepAlive, function () { return logger_1.Logger.info("Twitter has sent a keep-alive packet."); });
                        stream.connect();
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _g.sent();
                        if (error_1 instanceof twitter_api_v2_1.ApiResponseError &&
                            error_1.rateLimitError &&
                            error_1.rateLimit) {
                            logger_1.Logger.error("Hit the rate limit! Limit for this endpoint is ".concat(error_1.rateLimit.limit, " requests."));
                            logger_1.Logger.info("Request counter will reset at ".concat(new Date(error_1.rateLimit.reset), "."));
                        }
                        else {
                            logger_1.Logger.error(error_1.stack);
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        this.client = new twitter_api_v2_1.default(bearerToken);
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
