import TwitterApi, {
    ApiResponseError,
    ETwitterStreamEvent,
} from "twitter-api-v2";
import { Logger } from "../logger";
import mqtt, { MqttClient } from "mqtt";

const streamingRules = [
    {
        tag: "get tweets only from @cogsandsquigs",
        value: "from:cogsandsquigs",
    },
];

export class Twitter {
    private client: TwitterApi;
    private mqtt: mqtt.MqttClient;
    private topic: string;

    constructor(bearerToken: string, mqttServer: string, topic: string) {
        this.client = new TwitterApi(bearerToken);
        this.mqtt = mqtt.connect(mqttServer);
        this.topic = topic;

        this.mqtt.on("connect", () => {
            Logger.info(`Connected to MQTT server ${mqttServer}`);
            this.mqtt.subscribe(this.topic, { qos: 2 }, (err) => {
                if (err) {
                    Logger.error(
                        `Error subscribing to topic ${topic}: ${err.stack}`
                    );
                } else {
                    Logger.info(`Subscribed to MQTT topic ${topic}`);
                }
            });
        });

        this.mqtt.on("message", (topic, message) => {
            // message is Buffer
            Logger.info(
                `Recieved mqtt message on topic ${topic}: ${message.toString()}`
            );
        });
    }

    public start = async (): Promise<void> => {
        try {
            /**
             * Updating streaming rules, so that we can verify that all rules are
             * a) up-to-date, and
             * b) are being applied to the stream.
             */

            const currentRules = await this.client.v2.streamRules();

            Logger.info(
                `Twitter streaming rules: ${(
                    (await this.client.v2.streamRules()).data || []
                )
                    .map((rule) => `${rule.id}: ${rule.tag}`)
                    .join(", ")}`
            );

            if (
                currentRules.data !== undefined &&
                currentRules.data.length > 0
            ) {
                await this.client.v2.updateStreamRules({
                    delete: {
                        ids: currentRules.data.map((rule) => rule.id),
                    },
                });
            }

            if (
                currentRules.data === undefined ||
                streamingRules.filter(
                    (rule) =>
                        !currentRules.data.find((r) => r.value === rule.value)
                ).length > 0
            ) {
                Logger.info("Adding streaming rules...");

                await this.client.v2.updateStreamRules({
                    add: streamingRules.filter(
                        (rule) =>
                            !(currentRules.data || []).find(
                                (r) => r.value === rule.value
                            )
                    ),
                });

                Logger.info(
                    `Twitter streaming rules updated: ${(
                        await this.client.v2.streamRules()
                    ).data
                        .map((rule) => `${rule.id}: ${rule.tag}`)
                        .join(", ")}`
                );
            }

            Logger.info("Streaming rules up to date.");

            /**
             * Run the twitter tweet stream.
             */
            let stream = await this.client.v2.searchStream({
                autoConnect: true,
            });

            stream.on(
                // Emitted when the stream is connected.
                ETwitterStreamEvent.Connected,
                () => {
                    Logger.info("Connected to Twitter tweet stream.");
                }
            );

            stream.on(
                // Emitted when Node.js {response} emits a 'error' event (contains its payload).
                ETwitterStreamEvent.ConnectionError,
                (err) => Logger.error(`Twitter stream connection error: ${err}`)
            );

            stream.on(
                // Emitted when the stream connection is lost.
                ETwitterStreamEvent.ConnectionLost,
                () => {
                    Logger.error("Connection to Twitter tweet stream lost.");
                }
            );

            stream.on(
                // Emitted when Node.js {response} is closed by remote or using .close().
                ETwitterStreamEvent.ConnectionClosed,
                () => Logger.warn("Connection has been closed.")
            );

            stream.on(
                // Emitted when a Twitter payload (a tweet or not, given the endpoint).
                ETwitterStreamEvent.Data,
                (eventData) => {
                    try {
                        Logger.info(
                            `Recieved a tweet: "${eventData.data.text}"`
                        );
                        this.mqtt.publish(
                            this.topic,
                            JSON.stringify(eventData.data),
                            { qos: 2 },
                            (err) => {
                                if (err) {
                                    Logger.error(
                                        `Error publishing to MQTT topic ${this.topic}: ${err}`
                                    );
                                }
                            }
                        );
                        Logger.info(
                            `Tweet published to MQTT topic ${this.topic}`
                        );
                    } catch (error) {
                        Logger.error((error as Error).stack);
                    }
                }
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
                    `Hit the rate limit! Limit for this endpoint is ${error.rateLimit.limit} requests.`
                );
                Logger.info(
                    `Request counter will reset at ${new Date(
                        error.rateLimit.reset
                    )}.`
                );
            } else {
                Logger.error((error as Error).stack);
            }
        }
    };
}
