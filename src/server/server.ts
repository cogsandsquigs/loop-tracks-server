import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";
import express, { Router } from "express";
import { Logger } from "../logger";
import { CTA } from "./cta";
import { Source } from "./source";
import { TrainData } from "./train";
import { MBTA } from "./mbta";

export class Server {
    private router: Router;
    private scheduler: ToadScheduler;
    private cache: Map<string, TrainData>;
    private sources: Source[];

    constructor() {
        this.router = Router();
        this.scheduler = new ToadScheduler();
        this.cache = new Map<string, TrainData>();
        this.sources = [new CTA(), new MBTA()];

        const task = new AsyncTask(
            "update train data cache in background",

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
        const job = new SimpleIntervalJob(
            { seconds: 15, runImmediately: true },
            task
        );
        this.scheduler.addSimpleIntervalJob(job);

        this.router.get("/:system", async (req, res) => {
            const system = req.params.system.toLowerCase();
            const lines = String(req.query.lines).split(",");

            if (lines[0] == "undefined") {
                res.status(400).send("No lines specified");
                return;
            }

            try {
                let data = this.cache.get(system);
                if (data === undefined) {
                    res.status(400).send(
                        "Unknown transportation/railway system"
                    );
                } else {
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
