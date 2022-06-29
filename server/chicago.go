package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

type chicagoTrainLineData struct {
	CTATT struct {
		Timestamp string `json:"tmst"`
		ErrorCode string `json:"errCd"`
		ErrorName string `json:"errNm"`
		Route     []struct {
			Name  string `json:"@name"`
			Train []struct {
				RunNumber           string `json:"rn"`
				DestinationID       string `json:"destSt"`
				DestinationName     string `json:"destNm"`
				TrainRouteDirection string `json:"trDr"`
				NextStationID       string `json:"nextStaId"`
				NextStopID          string `json:"nextStpId"`
				NextStationName     string `json:"nextStaNm"`
				PredictionGenerated string `json:"prdt"`
				ArrivalTime         string `json:"arrT"`
				IsApproaching       string `json:"isApp"`
				IsDelayed           string `json:"isDly"`
				Latitude            string `json:"lat"`
				Longitude           string `json:"lon"`
				Heading             string `json:"heading"`
			} `json:"train"`
		} `json:"route"`
	}
}

func GetChicagoData(apiKey string, lines []string) (map[string][]Train, error) {

	requestLines := ""
	for _, line := range lines {
		switch line {
		case "pink":
			requestLines += "pink,"
		case "red":
			requestLines += "red,"
		case "orange":
			requestLines += "org,"
		case "yellow":
			requestLines += "y,"
		case "green":
			requestLines += "g,"
		case "blue":
			requestLines += "blue,"
		case "purple":
			requestLines += "p,"
		case "brown":
			requestLines += "brn,"
		default:
			return nil, fmt.Errorf("line %s not found", line)
		}
	}
	requestLines = requestLines[:len(requestLines)-1]

	res, err := http.Get(fmt.Sprintf("http://lapi.transitchicago.com/api/1.0/ttpositions.aspx?key=%s&rt=%s&outputType=JSON", apiKey, requestLines))

	if err != nil {
		return nil, err
	}

	var data chicagoTrainLineData

	err = json.NewDecoder(res.Body).Decode(&data)

	if err != nil {
		return nil, err
	}

	ret := make(map[string][]Train)

	for i, route := range data.CTATT.Route {
		for _, train := range route.Train {
			lat, err := strconv.ParseFloat(train.Latitude, 64)
			if err != nil {
				return nil, err
			}

			lon, err := strconv.ParseFloat(train.Longitude, 64)
			if err != nil {
				return nil, err
			}

			dir, err := strconv.Atoi(train.TrainRouteDirection)

			if err != nil {
				return nil, err
			}

			if _, ok := ret[lines[i]]; !ok {
				ret[lines[i]] = []Train{}
			}

			ret[lines[i]] = append(ret[lines[i]], Train{
				Latitude:  lat,
				Longitude: lon,
				RailName:  lines[i],
				Direction: dir,
			})
		}
	}

	return ret, nil
}
