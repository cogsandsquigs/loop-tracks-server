import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import express, { Router } from "express";
import { Logger } from "../logger";
import { CTA } from "./cta";
import { Source, SourceConstructor } from "./source";
import { TrainData } from "./train";
import { MBTA } from "./mbta";

export class Server {
    private router: Router;
    private scheduler: ToadScheduler;
    private cache: Map<string, TrainData>;
    private sourceConstructors: SourceConstructor[];
    private sources: Source[] = [];

    constructor(backgroundCacheUpdateSeconds: number, apiKeys: Object) {
        this.router = Router();
        this.scheduler = new ToadScheduler();
        this.cache = new Map<string, TrainData>();

        this.sourceConstructors = [CTA, MBTA];

        // assings sources to the server for updating data cache
        for (const sourceConstructor of this.sourceConstructors) {
            const apiKey = Object.entries(apiKeys).find(
                ([key]) => key === sourceConstructor.name
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

            (err: Error) => {
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

        this.router.get("/:system", async (req, res) => {
            const system = req.params.system.toLowerCase();
            const lines = String(req.query.lines).split(",");

            if (lines[0] === undefined || lines[0] === "") {
                res.status(400).send({ error: "No lines specified" });
                return;
            }

            try {
                // cloning the cached data to prevent side effects on/mutations of the cache
                let data = structuredClone(this.cache.get(system));

                if (data === undefined) {
                    res.status(400).send({
                        error: "Unknown transportation/railway system",
                    });
                } else {
                    // checks if requested rail line is actually a line that exists in the data
                    if (
                        lines.every((line) => {
                            if (
                                !Object.keys(data?.train_lines || {}).includes(
                                    line
                                )
                            ) {
                                res.status(400).send({
                                    error: `Unknown rail line ${line}`,
                                });
                                return false;
                            } else {
                                return true;
                            }
                        })
                    ) {
                        // filters out all the lines that are not in the list of lines requested.
                        // converts the train_lines object to a map, filters the map, and converts it back to an object.
                        data.train_lines = Object.fromEntries(
                            new Map<string, any>(
                                [...Object.entries(data.train_lines)].filter(
                                    (line) => lines.includes(line[0])
                                )
                            )
                        );
                        res.status(200).send(data);
                    }
                }
            } catch (err) {
                res.status(500).send({ error: err });
            }
        });
    }

    public listen(port: string | number) {
        const app = express();
        app.use("/", this.router);
        app.listen(port, () => {
            Logger.info(`App is listening on port ${port}`);
        });
    }
}
