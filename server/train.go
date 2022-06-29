package server

type TrainData struct {
	Timestamp int64      `json:"timestamp"`   // unix timestamp of when data was last updated
	City      string     `json:"city"`        // city name of where the data comes from
	Lines     TrainLines `json:"train_lines"` // the train lines and their trains
}

type TrainLines map[string][]Train // a collection of train lines, each containing some trains

type Train struct {
	LineName    string  `json:"line_name"`    // name of the rail line
	NextStation string  `json:"next_station"` // name of the next station
	Latitude    float64 `json:"latitude"`     // latitude of the train
	Longitude   float64 `json:"longitude"`    // longitude of the train
	Direction   int     `json:"direction"`    // direction of train, 1 = north, 5 = south
	Heading     int     `json:"heading"`      // heading of train, 0 = north, 90 = east, 180 = south, 270 = west
}
