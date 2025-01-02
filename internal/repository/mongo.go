package utils

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDatabase *mongo.Database // Holds the reference to the Instant_Chat database

// ConnectToMongo connects to the MongoDB database using the connection string from the .env file.
func ConnectToMongo() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Get MongoDB URL from environment variables
	mongoURI := os.Getenv("MONGODB_URL")
	if mongoURI == "" {
		log.Fatal("MONGODB_URL is not set in .env file")
	}
	fmt.Println("MongoDB URI:", mongoURI)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Verify the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	fmt.Println("Connected to MongoDB successfully!")
	MongoClient = client

	// Connect to the Instant_Chat database
	MongoDatabase = client.Database("Instant_Chat")
	fmt.Println("Connected to the database: Instant_Chat")
}

// GetDatabase returns the MongoDB database instance.
func GetDatabase() *mongo.Database {
	if MongoDatabase == nil {
		log.Fatal("MongoDatabase is not initialized. Call ConnectToMongo first.")
	}
	return MongoDatabase
}
