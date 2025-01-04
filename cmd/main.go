package main

import (
	"log"
	"net/http"

	"github.com/rohanrj3296/GolangChatWebApp/dbrepo"
	"github.com/rs/cors"
	"github.com/gorilla/mux"
	"github.com/rohanrj3296/GolangChatWebApp/middlewares"
)

type Repository struct {
	DB *dbrepo.Repository
}

func main() {
	// Initialize the DB operations
	db := &dbrepo.Repository{}

	// Initialize the router
	r := mux.NewRouter()

	// Register the routes
	r.HandleFunc("/register", db.RegistrationHandler).Methods("POST")
	r.HandleFunc("/login", db.LoginHandler).Methods("POST")
	r.HandleFunc("/chat", db.AllUsersHandler).Methods("GET")
	r.Handle("/getuserfromsession", middlewares.CorsMiddleware(http.HandlerFunc(db.GetUserFromSession)))

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	handler := c.Handler(r)

	// Connect to the database
	if err := db.DB.ConnectToMongo(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Start the web server
	log.Println("Server starting on http://localhost:8080")
	err := http.ListenAndServe(":8080", handler)
	if err != nil {
		log.Fatal("Error starting server: ", err)
	}
}
