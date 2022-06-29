package server

type Train struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	RailName  string  `json:"rail_name"`
	Direction int     `json:"direction"` // direction of train, 1 = north, 5 = south
}
