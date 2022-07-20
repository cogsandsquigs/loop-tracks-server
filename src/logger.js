import fs from "fs";

export class Logger {
    logToFile; // the filename you are logging to

    static config(config) {
        this.logToFile = config.logToFile;
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
        if (
            this.logToFile !== null &&
            this.logToFile !== undefined &&
            this.logToFile !== ""
        ) {
            fs.appendFileSync(this.logToFile, `${message}\n`);
        }

        console.log(`${new Date().toISOString()} ${message}`);
    }
}
