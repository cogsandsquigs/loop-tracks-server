"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server/server");
const toml_1 = __importDefault(require("toml"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./logger");
try {
    let config = toml_1.default.parse(fs_1.default.readFileSync("./config.toml", "utf8"));
    const server = new server_1.Server(config.cacheUpdateDelay, config.apiKeys);
    let port = process.env.PORT || 3131;
    server.listen(port);
}
catch (error) {
    logger_1.Logger.error(error);
}
