"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
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
        console.log(`${new Date().toISOString()} ${message}`);
    }
}
exports.Logger = Logger;
