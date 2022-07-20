import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import express, { Router } from "express";
import { Logger } from "../logger.js";
import { CTA } from "./cta.js";
import { MBTA } from "./mbta.js";

export class Server {
    router;
    scheduler;
    cache;
    sourceConstructors;
    sources = [];

    constructor(backgroundCacheUpdateSeconds, apiKeys) {
        this.router = Router();
        this.scheduler = new ToadScheduler();
        this.cache = new Map();

        this.sourceConstructors = [CTA, MBTA];

        // assings sources to the server for updating data cache
        for (const sourceConstructor of this.sourceConstructors) {
            const apiKey = Object.entries(apiKeys).find(
                ([key]) =>
                    key.toLowerCase() == sourceConstructor.name.toLowerCase()
            );

            if (apiKey && apiKey[1] !== "") {
                this.sources.push(new sourceConstructor(apiKey[1]));
            } else {
                Logger.warn(
                    `No API key found for the ${sourceConstructor.name} rail system. Is this intentional, or do you mean to add one?`
                );
                this.sources.push(new sourceConstructor(""));
            }
        }

        // creates a new task update the cache in the background
        const task = new AsyncTask(
            "Update train data cache in background",

            // updates cache with data from all sources
            async () => {
                Logger.info("Updating train data cache...");
                for (const source of this.sources) {
                    const data = await source.getData();
                    this.cache.set(source.name, data);
                }
                Logger.info("Train data cache updated!");
            },

            (err) => {
                Logger.error(
                    `Error while updating data: ${err.message}\n${err.stack}`
                );
            }
        );

        // creates a new job that runs the task every n seconds
        const job = new SimpleIntervalJob(
            { seconds: backgroundCacheUpdateSeconds, runImmediately: true },
            task
        );

        this.scheduler.addSimpleIntervalJob(job);

        // DEPRECIATED: use /system/:system instead
        this.router.get("/:system", this.trainSystemHandler.bind(this));
        // Gets train data for a given transportation system
        this.router.get("/system/:system", this.trainSystemHandler.bind(this));
    }

    start = (port) => {
        const app = express();
        app.use("/", this.router);
        app.listen(port, () => {
            Logger.info(`App is listening on port ${port}`);
        });
    };

    trainSystemHandler = async (req, res) => {
        const system = req.params.system.toLowerCase();
        const lines = String(req.query.lines).split(",");

        res.removeHeader("Transfer-Encoding");
        res.set("Connection", "close");
        res.removeHeader("Keep-Alive");

        if (lines[0] === undefined || lines[0] === "") {
            res.status(400).send({ error: "No lines specified" });
            return;
        }

        try {
            let c = this.cache.get(system);

            if (c === undefined) {
                res.status(400).send({
                    error: "Unknown transportation/railway system",
                });
            } else {
                // returns an error if any line requested does not exist for the given system
                for (const line of lines) {
                    if (c.lines.find((l) => l.name == line) === undefined) {
                        res.status(400).send({
                            error: `Line ${line} does not exist for ${system}`,
                        });
                        return;
                    }
                }

                // hacky way to clone data w/o structuredClone
                let data = new TrainData(
                    c.timestamp,
                    c.system,
                    c.lines.filter((l) => lines.includes(l.name))
                );

                res.status(200).send(data);
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({ error: String(err) });
        }
    };
}
