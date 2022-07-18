import { Server } from "./http-server/server";
import toml from "toml";
import fs from "fs";
import { Logger } from "./logger";
import { test } from "./mqtt-twitter/twitter";

try {
    let config = toml.parse(fs.readFileSync("./config.toml", "utf8"));

    test(config.apiKeys.twitter.bearerToken);

    const server = new Server(config.cacheUpdateDelay, config.apiKeys.trains);

    let port = config.port || process.env.PORT || 3003;

    server.listen(port);
} catch (error) {
    Logger.error(error);
}
