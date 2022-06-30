export class TrainData {
    timestamp: number;
    system: string;
    train_lines: Object;
    constructor(
        timestamp: number,
        system: string,
        train_lines: Map<string, Train>
    ) {
        this.timestamp = timestamp;
        this.system = system;
        this.train_lines = Object.fromEntries(train_lines);
    }
}

export class Train {
    line_name: string;
    next_stop: string;
    direction: number;
    heading: number;
    latitude: number;
    longitude: number;

    constructor(
        line_name: string,
        next_stop: string,
        direction: number,
        heading: number,
        latitude: number,
        longitude: number
    ) {
        this.line_name = line_name;
        this.next_stop = next_stop;
        this.direction = direction;
        this.heading = heading;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
