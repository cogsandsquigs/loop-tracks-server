package server

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
}

func NewServer() *Server {
	router := gin.Default()

	router.GET("/:city", func(c *gin.Context) {
		city := c.Param("city")

		lines := c.Query("lines")
		if len(lines) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "lines parameter is required"})
			return
		}

		switch city {
		case "chicago":
			data, err := GetChicagoData("00ff09063caa46748434d5fa321d048f", strings.Split(lines, ","))

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			c.JSON(http.StatusOK, data)
		default:
			c.JSON(400, gin.H{
				"error": "city not found",
			})
		}
	})

	return &Server{
		router: router,
	}
}

func (s *Server) Run() {
	s.router.Run()
}
