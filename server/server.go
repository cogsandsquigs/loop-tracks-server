package server

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type Server struct {
	router                *gin.Engine                           // router for the server
	lock                  sync.Mutex                            // lock for the data
	data                  map[string]*TrainData                 // train data, updated in background
	dataHooks             map[string]func() (*TrainData, error) // train data update functions
	backgroundUpdateDelay time.Duration                         // time to wait before updating data in background per every update cycle

}

func NewServer(backgroundUpdateDelay time.Duration) *Server {
	server := &Server{
		router: gin.Default(),
		dataHooks: map[string]func() (*TrainData, error){
			"cta": func() (*TrainData, error) {
				return GetCTAData([]string{"pink", "red", "orange", "yellow", "green", "blue", "purple", "brown"})
			},
			"mbta": func() (*TrainData, error) {
				return GetMBTAData()
			},
		},
		data:                  map[string]*TrainData{},
		backgroundUpdateDelay: backgroundUpdateDelay,
	}

	server.router.GET("/:system", func(c *gin.Context) {
		system := c.Param("system")

		if system == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "transit system parameter required"})
			return
		}

		lines := c.Query("lines")

		if len(lines) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "lines query parameter is required"})
			return
		}

		data, err := server.GetData(system, strings.Split(lines, ","))

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, data)

	})

	return server
}

func (s *Server) Run() {
	go func() {
		for {
			log.Println("updating data...")
			err := s.UpdateData()
			if err != nil {
				log.Println("error updating data: ", err)
			} else {
				log.Println("data updated!")
			}
			time.Sleep(s.backgroundUpdateDelay)
		}
	}()
	s.router.Run()
}

func (s *Server) GetData(system string, lines []string) (*TrainData, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	if _, ok := s.data[system]; !ok {
		if _, ok := s.dataHooks[system]; !ok {
			return nil, fmt.Errorf("train system %s not found", system)
		}

		data, err := s.dataHooks[system]()

		if err != nil {
			return nil, err
		}

		s.data[system] = data
	}

	ret := *s.data[system]
	ret.Lines = map[string][]Train{}

	for _, line := range lines {
		if _, ok := s.data[system].Lines[line]; !ok {
			return nil, fmt.Errorf("line %s not found", line)
		}
		ret.Lines[line] = s.data[system].Lines[line]
	}

	return &ret, nil
}

// updates the data for all the cities
func (s *Server) UpdateData() error {
	s.lock.Lock()
	defer s.lock.Unlock()
	for system, dataFunc := range s.dataHooks {
		data, err := dataFunc()

		if err != nil {
			return err
		}

		s.data[system] = data
	}
	return nil
}
