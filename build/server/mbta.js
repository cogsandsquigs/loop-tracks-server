"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MBTA = void 0;
const axios_1 = __importDefault(require("axios"));
const train_1 = require("./train");
class MBTA {
    name = "mbta";
    // doesn't require an api key, so this can be empty
    constructor(apiKey) { }
    getData() {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios_1.default.get("https://api-v3.mbta.com/vehicles");
                resolve(new train_1.TrainData(Math.round(new Date(response.data.data[0].attributes.updated_at // this isn't the actual value of when all of the trains were updated on the MBTA servers, but it's close enough that it's fine
                ).getTime() / 1000), "mbta", response.data.data
                    // filters out non-train vehicles
                    .filter((vehicle) => vehicle.id.includes("-") &&
                    vehicle.relationships.route.data.id !=
                        "Mattapan")
                    // converts the train data to a Train object
                    .map((train) => [
                    String(train.relationships.route.data.id)
                        .split("-")[0]
                        .toLowerCase(),
                    new train_1.Train(String(train.relationships.stop.data !== null
                        ? train.relationships.stop.data.id
                        : "unknown"), "unknown", 4 * Number(train.attributes.direction_id) +
                        1, Number(train.attributes.bearing), Number(train.attributes.latitude), Number(train.attributes.longitude)),
                ])
                    // converts the train data to a Map to prepare for insertion into TrainData object
                    .reduce((acc, l) => {
                    if (acc.find((line) => line.name == l[0])) {
                        acc.find((line) => line.name == l[0])?.trains.push(l[1]);
                    }
                    else {
                        acc.push(new train_1.Line(l[0], [l[1]]));
                    }
                    return acc;
                }, [])));
            }
            catch (error) {
                reject(error);
            }
        });
    }
}
exports.MBTA = MBTA;
