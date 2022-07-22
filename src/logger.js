import { ToadScheduler, LongIntervalJob, AsyncTask } from "toad-scheduler";
import fs from "fs";
import zlib from "zlib";
import path from "path";

export class Logger {
    logDir = null; // the directory you are logging to
    archivalInterval = 24; // the interval of archival in hours
    keepNumArchives = 3; // the number of archives to keep
    scheduler = null; // the scheduler

    static config(config) {
        this.logDir = config.logDir || null;
        if (this.logDir === "") {
            this.logDir = null;
        }
        this.archivalInterval = config.archivalInterval || 24;
        this.keepNumArchives = config.keepNumArchives || 3;

        if (this.logDir !== null) {
            fs.mkdirSync(this.logDir, { recursive: true });

            this.scheduler = new ToadScheduler();
            this.scheduler.addLongIntervalJob(
                new LongIntervalJob(
                    {
                        seconds: this.archivalInterval,
                    },
                    new AsyncTask("Archive logs", this.archiveLogs.bind(this))
                )
            );
        }
    }

    static async archiveLogs() {
        if (this.logToFile === null) {
            return;
        }

        this.info(`Archiving logs...`);

        let files = fs.readdirSync(this.logDir);

        let log = files.filter((file) => file.endsWith(".log"))[0];
        let archives = files.filter((file) => file.endsWith(".log.gz"));

        if (archives.length >= this.keepNumArchives) {
            archives
                .sort((a, b) => {
                    return (
                        fs.statSync(path.join(this.logDir, a)).birthtime -
                        fs.statSync(path.join(this.logDir, b)).birthtime
                    );
                })
                .splice(0, archives.length - this.keepNumArchives + 1)
                .map((file) => fs.unlinkSync(path.join(this.logDir, file)));
        }

        // compress contents of log file into a new file with .br (brotli) extension
        // and delete the original log file.

        const brotli = zlib.createGzip();
        const inStream = fs.createReadStream(path.join(this.logDir, log));
        const outStream = fs.createWriteStream(
            path.join(this.logDir, `logger-${new Date().toISOString()}.log.gz`)
        );
        inStream.pipe(brotli).pipe(outStream);
        inStream.on("end", () => {
            fs.unlinkSync(path.join(this.logDir, log));
        });
    }

    static debug(message) {
        this.log(`[DEBUG] ${message}`);
    }

    static info(message) {
        this.log(`[INFO] ${message}`);
    }

    static warn(message) {
        this.log(`[WARN] ${message}`);
    }

    static error(message) {
        this.log(`[ERROR] ${message}`);
    }

    static log(message) {
        if (this.logDir !== null && this.logDir !== "") {
            fs.mkdirSync(this.logDir, { recursive: true });
            fs.appendFileSync(
                path.join(this.logDir, "logger.log"),
                `${message}\n`,
                {
                    encoding: "utf8",
                }
            );
        }

        console.log(`${new Date().toISOString()} ${message}`);
    }
}
