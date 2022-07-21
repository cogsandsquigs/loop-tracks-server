import { Logger } from "../logger.js";
import path from "path";
import { Readable } from "node:stream";

const v2endpoint = "api.twitter.com/2";

export class Stream {
    bearer;

    constructor(bearer) {
        this.bearer = bearer;
    }

    applyRules = async (rules) => {
        let currentRules = await (
            await this.get("tweets/search/stream/rules")
        ).json();

        Logger.info(
            `Current Twitter streaming rules: ${currentRules.data
                .map((rule) => `${rule.tag || rule.value}`)
                .join(", ")}`
        );

        let rulesToDelete = currentRules.data
            .filter((rule) => !rules.find((r) => r.value === rule.value))
            .map((rule) => rule.id);

        let rulesToAdd = rules.filter(
            (rule) => !currentRules.data.find((r) => r.value === rule.value)
        );

        if (rulesToDelete.length > 0 || rulesToAdd.length > 0) {
            Logger.info("Updating Twitter streaming rules...");

            await this.post("tweets/search/stream/rules", {
                delete: {
                    ids: rulesToDelete,
                },
                add: rulesToAdd,
            });

            Logger.info(
                `Twitter streaming rules updated: ${rules
                    .map((rule) => `${rule.tag || rule.value}`)
                    .join(", ")}`
            );
        }

        Logger.info("Twitter streaming rules up to date.");
    };

    connect = async (onData) => {
        this.handleStream("tweets/search/stream", (data) => {
            switch (data) {
                case "\r\n":
                    Logger.info("Twitter sent a keep-alive packet.");
                    break;
                default:
                    onData(JSON.parse(data));
                    break;
            }
        });
    };

    handleStream = async (streamEndpoint, onData, reconnectTries) => {
        const reader = (await this.get(streamEndpoint)).body.getReader();

        Logger.info(`Connecting to stream at ${streamEndpoint}...`);

        let stream = new ReadableStream({
            start(controller) {
                try {
                    // The following function handles each data chunk
                    function push() {
                        // "done" is a Boolean and value a "Uint8Array"
                        return reader.read().then(({ done, value }) => {
                            // Is there no more data to read?
                            if (done) {
                                // Tell the browser that we have finished sending data
                                controller.close();

                                return;
                            }

                            // Get the data and send it to the browser via the controller
                            controller.enqueue(value);
                            push();
                        });
                    }

                    push();
                } catch (error) {
                    Logger.error(error.stack);
                }
            },
        });

        Logger.info(`Connected to stream at ${streamEndpoint}`);
        try {
            for await (const chunk of stream) {
                reconnectTries = 0;
                onData(new TextDecoder().decode(chunk));
            }

            reconnectTries += 1;

            Logger.info(`Stream at ${streamEndpoint} closed. Reconnecting...`);

            if (reconnectTries > 3) {
                Logger.warn(
                    `Reconnected too many times. Sleeping for ${
                        30 * (reconnectTries - 2)
                    } seconds.`
                );
                await sleep(30000 * (reconnectTries - 2));
            }

            this.handleStream(streamEndpoint, onData);
        } catch (error) {
            reconnectTries += 1;

            Logger.error(error.stack);

            Logger.error(
                `Stream at ${streamEndpoint} closed with an error. Reconnecting...`
            );

            await stream.cancel(error);

            if (reconnectTries > 3) {
                Logger.warn(
                    `Reconnected too many times. Sleeping for ${
                        30 * reconnectTries
                    } seconds.`
                );
                await sleep(30000 * reconnectTries);
            }

            this.handleStream(streamEndpoint, onData);
        }
    };

    get = async (route) => {
        let endpoint = path.join(v2endpoint, route);

        return await fetch(`https://${endpoint}`, {
            headers: {
                Authorization: `Bearer ${this.bearer}`,
            },
        });
    };

    post = async (route, data) => {
        let endpoint = path.join(v2endpoint, route);

        return await fetch(`https://${endpoint}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.bearer}`,
            },
            body: JSON.stringify(data),
        });
    };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
