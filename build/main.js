"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server/server");
var toml_1 = __importDefault(require("toml"));
var fs_1 = __importDefault(require("fs"));
var logger_1 = require("./logger");
try {
    var config = toml_1.default.parse(fs_1.default.readFileSync("./config.toml", "utf8"));
    var server = new server_1.Server(config.cacheUpdateDelay, config.apiKeys);
    var port = config.port || process.env.PORT || 3003;
    server.listen(port);
}
catch (error) {
    logger_1.Logger.error(error);
}
