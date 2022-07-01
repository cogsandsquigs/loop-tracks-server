"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const toad_scheduler_1 = require("toad-scheduler");
const express_1 = __importStar(require("express"));
const logger_1 = require("../logger");
const cta_1 = require("./cta");
const mbta_1 = require("./mbta");
class Server {
    router;
    scheduler;
    cache;
    sourceConstructors;
    sources = [];
    constructor(backgroundCacheUpdateSeconds, apiKeys) {
        this.router = (0, express_1.Router)();
        this.scheduler = new toad_scheduler_1.ToadScheduler();
        this.cache = new Map();
        this.sourceConstructors = [cta_1.CTA, mbta_1.MBTA];
        // assings sources to the server for updating data cache
        for (const sourceConstructor of this.sourceConstructors) {
            const apiKey = Object.entries(apiKeys).find(([key]) => key.toLowerCase() == sourceConstructor.name.toLowerCase());
            if (apiKey && apiKey[1] !== "") {
                this.sources.push(new sourceConstructor(apiKey[1]));
            }
            else {
                logger_1.Logger.warn(`No API key found for the ${sourceConstructor.name} rail system. Is this intentional, or do you mean to add one?`);
                this.sources.push(new sourceConstructor(""));
            }
        }
        // creates a new task update the cache in the background
        const task = new toad_scheduler_1.AsyncTask("Update train data cache in background", 
        // updates cache with data from all sources
        async () => {
            logger_1.Logger.info("Updating train data cache...");
            for (const source of this.sources) {
                const data = await source.getData();
                this.cache.set(source.name, data);
            }
            logger_1.Logger.info("Train data cache updated!");
        }, (err) => {
            logger_1.Logger.error(`Error while updating data: ${err.message}\n${err.stack}`);
        });
        // creates a new job that runs the task every n seconds
        const job = new toad_scheduler_1.SimpleIntervalJob({ seconds: backgroundCacheUpdateSeconds, runImmediately: true }, task);
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
                }
                else {
                    // returns an error if any line requested does not exist for the given system
                    for (const line of lines) {
                        if (data.lines.find((l) => l.name == line) ===
                            undefined) {
                            res.status(400).send({
                                error: `Line ${line} does not exist for ${system}`,
                            });
                            return;
                        }
                    }
                    // filters out all the lines that are not in the list of lines requested.
                    // converts the train_lines object to a map, filters the map, and converts it back to an object.
                    data.lines = data.lines.filter((line) => lines.includes(line.name));
                    res.status(200).send(data);
                }
            }
            catch (err) {
                console.log(err);
                res.status(500).send({ error: String(err) });
            }
        });
    }
    listen(port) {
        const app = (0, express_1.default)();
        app.use("/", this.router);
        app.listen(port, () => {
            logger_1.Logger.info(`App is listening on port ${port}`);
        });
    }
}
exports.Server = Server;
