"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CTA = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../logger");
const train_1 = require("./train");
class CTA {
    apiKey;
    name = "cta";
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async getData() {
        const lines = [
            "pink",
            "red",
            "orange",
            "yellow",
            "green",
            "blue",
            "purple",
            "brown",
        ];
        // converts the lines to a comma separated string with values that reflect the CTA API naming of lines
        let requestLines = lines
            .map((line) => {
            switch (line) {
                case "pink":
                    return "pink";
                case "red":
                    return "red";
                case "orange":
                    return "org";
                case "yellow":
                    return "y";
                case "green":
                    return "g";
                case "blue":
                    return "blue";
                case "purple":
                    return "p";
                case "brown":
                    return "brn";
                default:
                    throw `Unknown line: ${line}`;
            }
        })
            .join(",");
        // fetches data from the CTA API
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios_1.default.get(`http://lapi.transitchicago.com//api/1.0/ttpositions.aspx?key=${this.apiKey}&rt=${requestLines}&outputType=JSON`);
                let data = response.data;
                resolve(new train_1.TrainData(Math.round(new Date(data.ctatt.tmst).getTime() / 1000), "cta", data.ctatt.route
                    // converts the train data to a list of Line objects
                    .map((route, index) => {
                    if (route.train == undefined) {
                        logger_1.Logger.warn(`No train data found for ${lines[index]} line`);
                        return [lines[index], []];
                    }
                    else if (route.train.constructor.name != "Array") {
                        return new train_1.Line(lines[index], [
                            new train_1.Train(route.train.nextStaNm, route.train.destNm, Number(route.train.trDr), Number(route.train.heading), Number(route.train.lat), Number(route.train.lon)),
                        ]);
                    }
                    return new train_1.Line(lines[index], route.train.map((train) => {
                        return new train_1.Train(train.nextStaNm, train.destNm, Number(train.trDr), Number(train.heading), Number(train.lat), Number(train.lon));
                    }));
                })));
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.CTA = CTA;
