import { Server } from "./http-server/server";
import { Twitter } from "./mqtt-twitter/twitter";
import toml from "toml";
import fs from "fs";
import { Logger } from "./logger";

try {
    let config = toml.parse(fs.readFileSync("./config.toml", "utf8"));

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

    let port = config.port || process.env.PORT || 3003;

    server.start(port);
    twitter.start();
} catch (error) {
    Logger.error(error);
}
