import { Server } from "./server/server";
import toml from "toml";
import fs from "fs";
import { Logger } from "./logger";

try {
    let config = toml.parse(fs.readFileSync("./config.toml", "utf8"));

    const server = new Server(config.cacheUpdateDelay, config.apiKeys);

    let port = config.port || process.env.PORT || 3003;

    server.listen(port);
} catch (error) {
    Logger.error(error);
}
