import { Client as TwitterClient } from "twitter-api-sdk";
import { Logger } from "../logger";
import mqtt, { MqttClient } from "mqtt";

export class Twitter {
    private client: TwitterClient;
    private streamingRules: { tag?: string; value: string }[];
    private mqtt: MqttClient;
    private topic: string;

    constructor(
        bearerToken: string,
        streamingRules: { tag?: string; value: string }[],
        mqttServer: string,
        topic: string
    ) {
        this.client = new TwitterClient(bearerToken); //new TwitterApi(bearerToken);
        this.streamingRules = streamingRules;
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

            const currentRules = await this.client.tweets.getRules();

            Logger.info(
                `Twitter streaming rules: ${(currentRules.data || [])
                    .map((rule) => `${rule.tag || rule.value}`)
                    .join(", ")}`
            );

            if (
                currentRules.data !== undefined &&
                currentRules.data.length > 0
            ) {
                await this.client.tweets.addOrDeleteRules({
                    delete: {
                        ids: currentRules.data.map(
                            (rule) => rule.id
                        ) as string[],
                    },
                });
            }

            if (
                currentRules.data === undefined ||
                this.streamingRules.filter(
                    (rule) =>
                        !currentRules.data.find((r) => r.value === rule.value)
                ).length > 0
            ) {
                Logger.info("Adding streaming rules...");

                await this.client.tweets.addOrDeleteRules({
                    add: this.streamingRules.filter(
                        (rule) =>
                            !(currentRules.data || []).find(
                                (r) => r.value === rule.value
                            )
                    ),
                });

                Logger.info(
                    `Twitter streaming rules updated: ${this.streamingRules
                        .map((rule) => `${rule.tag || rule.value}`)
                        .join(", ")}`
                );
            }

            Logger.info("Streaming rules up to date.");

            /**
             * Run the twitter tweet stream.
             */
            let stream = await this.client.tweets.searchStream();

            for await (const tweet of stream) {
                Logger.info(`Recieved a tweet: "${tweet.data?.text}"`);
                this.mqtt.publish(
                    this.topic,
                    JSON.stringify(tweet.data),
                    { qos: 2 },
                    (err) => {
                        if (err) {
                            Logger.error(
                                `Error publishing to MQTT topic ${this.topic}: ${err}`
                            );
                        }
                    }
                );
                Logger.info(`Tweet published to MQTT topic ${this.topic}`);
            }
        } catch (error) {
            Logger.error((error as Error).stack);
        }
    };
}
