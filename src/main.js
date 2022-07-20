import { Logger } from "./logger.js";
import { Server } from "./http-server/server.js";
import { Twitter } from "./mqtt-twitter/twitter.js";
import toml from "toml";
import fs from "fs";

try {
    const config = toml.parse(fs.readFileSync("./config.toml", "utf8"));

    const twitter = new Twitter(
        config.twitter.bearerToken,
        config.twitter.streamingRules,
        config.twitter.mqtt.server,
        config.twitter.mqtt.topic
    );

    const server = new Server(
        config.trains.cacheUpdateDelay,
        config.trains.apiKeys
    );

    server.start(config.port || process.env.PORT || 3003);
    twitter.start();
} catch (error) {
    Logger.error(error);
}
