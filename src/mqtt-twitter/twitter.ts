import TwitterApi, {
    ApiResponseError,
    ETwitterStreamEvent,
    StreamingV2UpdateRulesQuery,
} from "twitter-api-v2";
import dotenv from "dotenv";
import fs from "fs";
import { Logger } from "../logger";

// sets twitter API keys from .env file
process.env.TWITTER_BEARER_TOKEN =
    dotenv.parse(fs.readFileSync(".env")).TWITTER_BEARER_TOKEN ||
    process.env.TWITTER_BEARER_TOKEN;

const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || "");

const streamingRules = [
    {
        tag: "get tweets only from @cogsandsquigs",
        value: "from:cogsandsquigs",
    },
];

export const test = async () => {
    try {
        /**
         * Updating streaming rules, so that we can verify that all rules are
         * a) up-to-date, and
         * b) are being applied to the stream.
         */

        const currentRules = await client.v2.streamRules();

        Logger.info(
            `Twitter streaming rules: ${(
                (await client.v2.streamRules()).data || []
            )
                .map((rule) => `${rule.id}: ${rule.tag}`)
                .join(", ")}`
        );

        if (currentRules.data !== undefined && currentRules.data.length > 0) {
            await client.v2.updateStreamRules({
                delete: {
                    ids: currentRules.data.map((rule) => rule.id),
                },
            });
        }

        if (
            currentRules.data === undefined ||
            streamingRules.filter(
                (rule) => !currentRules.data.find((r) => r.value === rule.value)
            ).length > 0
        ) {
            Logger.info("Adding streaming rules...");

            await client.v2.updateStreamRules({
                add: streamingRules.filter(
                    (rule) =>
                        !(currentRules.data || []).find(
                            (r) => r.value === rule.value
                        )
                ),
            });

            Logger.info(
                `Twitter streaming rules updated: ${(
                    await client.v2.streamRules()
                ).data
                    .map((rule) => `${rule.id}: ${rule.tag}`)
                    .join(", ")}`
            );
        }

        Logger.info("Streaming rules up to date.");

        let stream = await client.v2.searchStream({
            autoConnect: true,
        });

        stream.on(
            // Emitted when Node.js {response} emits a 'error' event (contains its payload).
            ETwitterStreamEvent.ConnectionError,
            (err) => Logger.error(`Twitter stream connection error: ${err}`)
        );

        stream.on(
            // Emitted when Node.js {response} is closed by remote or using .close().
            ETwitterStreamEvent.ConnectionClosed,
            () => Logger.warn("Connection has been closed.")
        );

        stream.on(
            // Emitted when a Twitter payload (a tweet or not, given the endpoint).
            ETwitterStreamEvent.Data,
            (eventData) => console.log("Twitter has sent something:", eventData)
        );

        stream.on(
            // Emitted when a Twitter sent a signal to maintain connection active
            ETwitterStreamEvent.DataKeepAlive,
            () => Logger.info("Twitter has sent a keep-alive packet.")
        );

        stream.connect();
    } catch (error) {
        if (
            error instanceof ApiResponseError &&
            error.rateLimitError &&
            error.rateLimit
        ) {
            Logger.error(
                `You just hit the rate limit! Limit for this endpoint is ${error.rateLimit.limit} requests!`
            );
            Logger.error(
                `Request counter will reset at timestamp ${error.rateLimit.reset}.`
            );
        } else {
            Logger.error((error as Error).stack);
        }
    }
};
