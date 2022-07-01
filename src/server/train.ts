export class TrainData {
    timestamp: number;
    system: string;
    train_lines: Object;
    constructor(
        timestamp: number,
        system: string,
        train_lines: Map<string, Line>
    ) {
        this.timestamp = timestamp;
        this.system = system;
        this.train_lines = Object.fromEntries(train_lines);
    }
}

export class Line {
    name: string;
    count: number;
    trains: Train[];
    constructor(name: string, trains: Train[]) {
        this.name = name;
        this.count = trains.length;
        this.trains = trains;
    }
}

export class Train {
    next_stop: string;
    direction: number;
    heading: number;
    latitude: number;
    longitude: number;

    constructor(
        next_stop: string,
        direction: number,
        heading: number,
        latitude: number,
        longitude: number
    ) {
        this.next_stop = next_stop;
        this.direction = direction;
        this.heading = heading;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
