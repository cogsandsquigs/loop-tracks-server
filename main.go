package main

import (
	"main/server"
	"time"
)

func main() {
	server := server.NewServer(15 * time.Second)
	server.Run()
}
