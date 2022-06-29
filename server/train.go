package server

type Train struct {
	LineName    string  `json:"line_name"`    // name of the rail line
	NextStation string  `json:"next_station"` // name of the next station
	Latitude    float64 `json:"latitude"`     // latitude of the train
	Longitude   float64 `json:"longitude"`    // longitude of the train
	Direction   int     `json:"direction"`    // direction of train, 1 = north, 5 = south
}
