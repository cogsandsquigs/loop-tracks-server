import axios from "axios";
import { Logger } from "../logger";
import { Source } from "./source";
import { Line, Train, TrainData } from "./train";

export class CTA implements Source {
    private apiKey = "00ff09063caa46748434d5fa321d048f";

    public name: string = "cta";

    constructor() {}

    public async getData(): Promise<TrainData> {
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
                        return "pink,";
                    case "red":
                        return "red,";
                    case "orange":
                        return "org,";
                    case "yellow":
                        return "y,";
                    case "green":
                        return "g,";
                    case "blue":
                        return "blue,";
                    case "purple":
                        return "p,";
                    case "brown":
                        return "brn,";
                    default:
                        throw `Unknown line: ${line}`;
                }
            })
            .join("");
        requestLines = requestLines.substring(0, requestLines.length - 1);

        // fetches data from the CTA API
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get(
                    `http://lapi.transitchicago.com//api/1.0/ttpositions.aspx?key=${this.apiKey}&rt=${requestLines}&outputType=JSON`
                );

                let data = response.data;

                resolve(
                    new TrainData(
                        data.ctatt.tmst,
                        "cta",
                        new Map(
                            data.ctatt.route
                                // converts the train data to a list of [<line name>, <Train object>]
                                .map((route: any, index: number) => {
                                    if (route.train == undefined) {
                                        Logger.warn(
                                            `No train data found for ${lines[index]} line`
                                        );

                                        return [lines[index], []];
                                    } else if (
                                        route.train.constructor.name != "Array"
                                    ) {
                                        return [
                                            lines[index],
                                            new Line(lines[index], [
                                                new Train(
                                                    lines[index],
                                                    route.train.nextStaNm,
                                                    Number(route.train.trDr),
                                                    Number(route.train.heading),
                                                    Number(route.train.lat),
                                                    Number(route.train.lon)
                                                ),
                                            ]),
                                        ];
                                    }

                                    return [
                                        lines[index],
                                        new Line(
                                            lines[index],
                                            route.train.map((train: any) => {
                                                return new Train(
                                                    lines[index],
                                                    train.nextStaNm,
                                                    Number(train.trDr),
                                                    Number(train.heading),
                                                    Number(train.lat),
                                                    Number(train.lon)
                                                );
                                            })
                                        ),
                                    ];
                                })
                        )
                    )
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}
