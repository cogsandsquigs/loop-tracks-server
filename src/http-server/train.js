export class TrainData {
    timestamp;
    system;
    lines;
    constructor(timestamp, system, train_lines) {
        this.timestamp = timestamp;
        this.system = system;
        this.lines = train_lines;
    }
}

export class Line {
    name;
    count;
    trains;
    constructor(name, trains) {
        this.name = name;
        this.count = trains.length;
        this.trains = trains;
    }
}

export class Train {
    next_stop;
    destination;
    direction;
    heading;
    latitude;
    longitude;

    constructor(
        next_stop,
        destination,
        direction,
        heading,
        latitude,
        longitude
    ) {
        this.next_stop = next_stop;
        this.destination = destination;
        this.direction = direction;
        this.heading = heading;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
