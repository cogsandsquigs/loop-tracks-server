"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./http-server/server");
var twitter_1 = require("./mqtt-twitter/twitter");
var toml_1 = __importDefault(require("toml"));
var fs_1 = __importDefault(require("fs"));
var logger_1 = require("./logger");
try {
    var config = toml_1.default.parse(fs_1.default.readFileSync("./config.toml", "utf8"));
    var twitter = new twitter_1.Twitter(config.twitter.bearerToken, config.twitter.streamingRules, config.twitter.mqtt.server, config.twitter.mqtt.topic);
    var server = new server_1.Server(config.trains.cacheUpdateDelay, config.trains.apiKeys);
    var port = config.port || process.env.PORT || 3003;
    server.start(port);
    twitter.start();
}
catch (error) {
    logger_1.Logger.error(error);
}
