import {
    TwitterApi as TwitterClient,
    ETwitterStreamEvent,
} from "twitter-api-v2";
import { Logger } from "../logger.js";
import mqtt from "mqtt";
import { Stream } from "./stream.js";

export class Twitter {
    client;
    bearerToken;
    streamingRules;
    stream;
    mqtt;
    topic;

    constructor(bearerToken, streamingRules, mqttServer, topic) {
        this.client = new TwitterClient(bearerToken);
        this.bearerToken = bearerToken;
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

    start = async () => {
        try {
            let stream = new Stream(this.bearerToken);

            stream.applyRules(this.streamingRules);

            await stream.connect((data) => {
                const tweet = data["data"];
                Logger.info(`Recieved a tweet: "${tweet.text}"`);
                Logger.info("Publishing to mqtt...");
                this.mqtt.publish(this.topic, JSON.stringify(tweet), {
                    qos: 2,
                });
            });
        } catch (error) {
            Logger.error(error.stack);
        }
    };
}
