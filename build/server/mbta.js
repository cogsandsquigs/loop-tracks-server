"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MBTA = void 0;
var axios_1 = __importDefault(require("axios"));
var train_1 = require("./train");
var MBTA = /** @class */ (function () {
    // doesn't require an api key, so this can be empty
    function MBTA(apiKey) {
        this.name = "mbta";
    }
    MBTA.prototype.getData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("https://api-v3.mbta.com/vehicles")];
                    case 1:
                        response = _a.sent();
                        resolve(new train_1.TrainData(Math.round(new Date(response.data.data[0].attributes.updated_at // this isn't the actual value of when all of the trains were updated on the MBTA servers, but it's close enough that it's fine
                        ).getTime() / 1000), "mbta", response.data.data
                            // filters out non-train vehicles
                            .filter(function (vehicle) {
                            return vehicle.id.includes("-") &&
                                vehicle.relationships.route.data.id !=
                                    "Mattapan";
                        })
                            // converts the train data to a Train object
                            .map(function (train) { return [
                            String(train.relationships.route.data.id)
                                .split("-")[0]
                                .toLowerCase(),
                            new train_1.Train(String(train.relationships.stop.data !== null
                                ? train.relationships.stop.data.id
                                : "unknown"), "unknown", 4 * Number(train.attributes.direction_id) +
                                1, Number(train.attributes.bearing), Number(train.attributes.latitude), Number(train.attributes.longitude)),
                        ]; })
                            // converts the train data to a Map to prepare for insertion into TrainData object
                            .reduce(function (acc, l) {
                            var _a;
                            if (acc.find(function (line) { return line.name == l[0]; })) {
                                (_a = acc.find(function (line) { return line.name == l[0]; })) === null || _a === void 0 ? void 0 : _a.trains.push(l[1]);
                            }
                            else {
                                acc.push(new train_1.Line(l[0], [l[1]]));
                            }
                            return acc;
                        }, [])));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        reject(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    return MBTA;
}());
exports.MBTA = MBTA;
