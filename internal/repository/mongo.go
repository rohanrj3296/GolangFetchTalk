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
}

// GetDatabase returns the MongoDB database instance.
func GetDatabase(databaseName string) *mongo.Database {
	if MongoClient == nil {
		log.Fatal("MongoClient is not initialized. Call ConnectToMongo first.")
	}
	return MongoClient.Database(databaseName)
}
