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
	router                *gin.Engine                                   // router for the server
	lock                  sync.Mutex                                    // lock for the data
	data                  map[string]map[string][]Train                 // train data, updated in background
	dataHooks             map[string]func() (map[string][]Train, error) // train data update functions
	backgroundUpdateDelay time.Duration                                 // time to wait before updating data in background per every update cycle

}

func NewServer(backgroundUpdateDelay time.Duration) *Server {
	server := &Server{
		router: gin.Default(),
		dataHooks: map[string]func() (map[string][]Train, error){
			"chicago": func() (map[string][]Train, error) {
				return GetChicagoData([]string{"pink"})
			},
		},
		data:                  map[string]map[string][]Train{},
		backgroundUpdateDelay: backgroundUpdateDelay,
	}

	server.router.GET("/:city", func(c *gin.Context) {
		city := c.Param("city")

		if city == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "city parameter required"})
			return
		}

		lines := c.Query("lines")

		if len(lines) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "lines query parameter is required"})
			return
		}

		data, err := server.GetData(city, strings.Split(lines, ","))

		fmt.Println(data)

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

func (s *Server) GetData(city string, lines []string) (map[string][]Train, error) {
	s.lock.Lock()
	defer s.lock.Unlock()

	if _, ok := s.data[city]; !ok {
		if _, ok := s.dataHooks[city]; !ok {
			return nil, fmt.Errorf("city %s not found", city)
		}

		data, err := s.dataHooks[city]()

		if err != nil {
			return nil, err
		}

		s.data[city] = data
	}

	ret := map[string][]Train{}

	for _, line := range lines {
		if _, ok := s.data[city][line]; !ok {
			return nil, fmt.Errorf("line %s not found", line)
		}
		ret[line] = s.data[city][line]
	}

	return ret, nil
}

// updates the data for all the cities
func (s *Server) UpdateData() error {
	s.lock.Lock()
	defer s.lock.Unlock()
	for city, dataFunc := range s.dataHooks {
		data, err := dataFunc()

		if err != nil {
			return err
		}

		s.data[city] = data
	}
	return nil
}
