import axios from "axios";
import { Source } from "./source";
import { Line, Train, TrainData } from "./train";

export class MBTA implements Source {
    public name: string = "mbta";
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
                            .map(
                                (train: any) =>
                                    new Train(
                                        String(
                                            train.relationships.route.data.id
                                        )
                                            .split("-")[0]
                                            .toLowerCase(),
                                        String(
                                            train.relationships.stop.data !==
                                                null
                                                ? train.relationships.stop.data
                                                      .id
                                                : "unknown"
                                        ),
                                        4 *
                                            Number(
                                                train.attributes.direction_id
                                            ) +
                                            1,
                                        Number(train.attributes.bearing),
                                        Number(train.attributes.latitude),
                                        Number(train.attributes.longitude)
                                    )
                            )
                            // converts the train data to a Map to prepare for insertion into TrainData object
                            .reduce(
                                (
                                    acc: Map<string, Line>,
                                    train: Train
                                ): Map<string, Line> => {
                                    let line = acc.get(train.line);
                                    if (line !== undefined) {
                                        line.trains.push(train);
                                        line.count++;
                                        acc.set(train.line, line);
                                    } else {
                                        line = new Line(train.line, [train]);
                                        acc.set(train.line, line);
                                    }
                                    return acc;
                                },
                                new Map<string, Line>()
                            )
                    )
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}
