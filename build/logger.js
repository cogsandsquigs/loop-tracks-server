"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.debug = function (message) {
        this.log("[DEBUG] ".concat(message));
    };
    Logger.info = function (message) {
        this.log("[INFO] ".concat(message));
    };
    Logger.warn = function (message) {
        this.log("[WARN] ".concat(message));
    };
    Logger.error = function (message) {
        this.log("[ERROR] ".concat(message));
    };
    Logger.log = function (message) {
        console.log("".concat(new Date().toISOString(), " ").concat(message));
    };
    return Logger;
}());
exports.Logger = Logger;
