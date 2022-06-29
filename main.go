package main

import (
	"main/server"
	"time"
)

func main() {
	server := server.NewServer(30 * time.Second)
	server.Run()
}
