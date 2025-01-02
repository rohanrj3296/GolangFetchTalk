package dbrepo

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/rohanrj3296/GolangChatWebApp/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DBoperations struct {

}

func(m *DBoperations) InsertUserIntoDB(u models.User)error{
	db := m.GetDatabase()
	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := collection.InsertOne(ctx, u)
	if err != nil {
		return err
	}
	return nil

}


var MongoClient *mongo.Client
var MongoDatabase *mongo.Database // Holds the reference to the Instant_Chat database

func(m *DBoperations) ConnectToMongo() error {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		return fmt.Errorf("error loading .env file: %v", err)
	}

	// Get MongoDB URL from environment variables
	mongoURI := os.Getenv("MONGODB_URL")
	if mongoURI == "" {
		return fmt.Errorf("MONGODB_URL is not set in .env file")
	}
	fmt.Println("MongoDB URI:", mongoURI)

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Verify the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	fmt.Println("Connected to MongoDB successfully!")
	MongoClient = client

	// Connect to the Instant_Chat database
	MongoDatabase = client.Database("Instant_Chat")
	fmt.Println("Connected to the database: Instant_Chat")

	return nil
}

// GetDatabase returns the MongoDB database instance.
func(m *DBoperations) GetDatabase() *mongo.Database {
	if MongoDatabase == nil {
		log.Fatal("MongoDatabase is not initialized. Call ConnectToMongo first.")
	}
	return MongoDatabase
}


func (m *DBoperations) CheckEmailExists(email string) (bool, error) {
    var user models.User
	db := m.GetDatabase()
    err := db.Collection("users").FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return false, nil // Email does not exist
        }
        return false, err // Database error
    }
    return true, nil // Email exists
}

// GetHashedPasswordByEmail retrieves the hashed password for a given email
func (m *DBoperations) GetHashedPasswordByEmail(email string) (string, error) {
	var result struct {
		Password string `bson:"password"`
	}
	db:=m.GetDatabase()
	err:=db.Collection("users").FindOne(context.TODO(),bson.M{"email":email}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			
			return "User Not Found!!", nil
		}
		return "Database Error", err }

	return result.Password, nil
}

