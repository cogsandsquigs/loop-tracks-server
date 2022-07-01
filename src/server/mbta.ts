import axios from "axios";
import { Source } from "./source";
import { Line, Train, TrainData } from "./train";

export class MBTA implements Source {
    public name: string = "mbta";

    // doesn't require an api key, so this can be empty
    constructor(apiKey: string) {}

    public getData(): Promise<TrainData> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(
                    "https://api-v3.mbta.com/vehicles"
                );

                resolve(
                    new TrainData(
                        Date.now(),
                        "mbta",
                        response.data.data
                            // filters out non-train vehicles
                            .filter(
                                (vehicle: any) =>
                                    vehicle.id.includes("-") &&
                                    vehicle.relationships.route.data.id !=
                                        "Mattapan"
                            )
                            // converts the train data to a Train object
                            .map((train: any) => [
                                String(train.relationships.route.data.id)
                                    .split("-")[0]
                                    .toLowerCase(),
                                new Train(
                                    String(
                                        train.relationships.stop.data !== null
                                            ? train.relationships.stop.data.id
                                            : "unknown"
                                    ),
                                    "unknown",
                                    4 * Number(train.attributes.direction_id) +
                                        1,
                                    Number(train.attributes.bearing),
                                    Number(train.attributes.latitude),
                                    Number(train.attributes.longitude)
                                ),
                            ])
                            // converts the train data to a Map to prepare for insertion into TrainData object
                            .reduce(
                                (acc: Line[], l: [string, Train]): Line[] => {
                                    if (
                                        acc.find(
                                            (line: Line) => line.name == l[0]
                                        )
                                    ) {
                                        acc.find(
                                            (line: Line) => line.name == l[0]
                                        )?.trains.push(l[1]);
                                    } else {
                                        acc.push(new Line(l[0], [l[1]]));
                                    }

                                    return acc;
                                },
                                []
                            )
                    )
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}
