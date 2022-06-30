"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var log_1 = __importDefault(require("lib/log"));
var app = (0, express_1.default)();
app.get("/", function (req, res) {
    res.send("Hello World");
});
var port = process.env.PORT || 3000;
log_1.default.log("App is listening on port ".concat(port));
app.listen(3000);
