import { Line, Train, TrainData } from "./train.js";

export class MBTA {
    name = "mbta";

    // doesn't require an api key, so this can be empty
    constructor(apiKey) {}

    getData = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(
                    "https://api-v3.mbta.com/vehicles"
                );

                const data = await response.json();

                const trains = new TrainData(
                    Math.round(
                        new Date(
                            data.data[0].attributes.updated_at // this isn't the actual value of when all of the trains were updated on the MBTA servers, but it's close enough that it's fine
                        ).getTime() / 1000
                    ),
                    "mbta",
                    data.data
                        // filters out non-train vehicles
                        .filter(
                            (vehicle) =>
                                vehicle.id.includes("-") &&
                                vehicle.relationships.route.data.id !=
                                    "Mattapan"
                        )
                        // converts the train data to a Train object
                        .map((train) => [
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
                                4 * Number(train.attributes.direction_id) + 1,
                                Number(train.attributes.bearing),
                                Number(train.attributes.latitude),
                                Number(train.attributes.longitude)
                            ),
                        ])
                        // converts the train data to a list of train lines to prepare for insertion into TrainData object
                        .reduce((acc, [lineName, train]) => {
                            if (
                                acc
                                    .find((line) => line.name == lineName)
                                    ?.trains.push(train) == undefined
                            ) {
                                acc.push(new Line(lineName, [train]));
                            }

                            return acc;
                        }, [])
                );

                resolve(trains);
            } catch (error) {
                reject(error);
            }
        });
    };
}
