"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Train = exports.Line = exports.TrainData = void 0;
var TrainData = /** @class */ (function () {
    function TrainData(timestamp, system, train_lines) {
        this.timestamp = timestamp;
        this.system = system;
        this.lines = train_lines;
    }
    return TrainData;
}());
exports.TrainData = TrainData;
var Line = /** @class */ (function () {
    function Line(name, trains) {
        this.name = name;
        this.count = trains.length;
        this.trains = trains;
    }
    return Line;
}());
exports.Line = Line;
var Train = /** @class */ (function () {
    function Train(next_stop, destination, direction, heading, latitude, longitude) {
        this.next_stop = next_stop;
        this.destination = destination;
        this.direction = direction;
        this.heading = heading;
        this.latitude = latitude;
        this.longitude = longitude;
    }
    return Train;
}());
exports.Train = Train;
