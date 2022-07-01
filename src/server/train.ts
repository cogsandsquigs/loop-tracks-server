export class TrainData {
    timestamp: number;
    system: string;
    lines: Line[];
    constructor(timestamp: number, system: string, train_lines: Line[]) {
        this.timestamp = timestamp;
        this.system = system;
        this.lines = train_lines;
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
    destination: string;
    direction: number;
    heading: number;
    latitude: number;
    longitude: number;

    constructor(
        next_stop: string,
        destination: string,
        direction: number,
        heading: number,
        latitude: number,
        longitude: number
    ) {
        this.next_stop = next_stop;
        this.destination = destination;
        this.direction = direction;
        this.heading = heading;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
