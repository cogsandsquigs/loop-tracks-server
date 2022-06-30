"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Log = /** @class */ (function () {
    function Log() {
    }
    Log.log = function (message) {
        console.log(Date() + message);
    };
    return Log;
}());
exports.default = Log;
