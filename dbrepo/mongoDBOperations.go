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

func(m *DBoperations) GetUserIDByEmail(email string) (string,error){
	var result struct{
		UserID string `bson:"_id"`
	}
	db:=m.GetDatabase()
	err:=db.Collection("users").FindOne(context.TODO(),bson.M{"email":email}).Decode(&result)
	if err != nil {
		// Return an empty string and the actual error
		return "", fmt.Errorf("error fetching user ID by email: %w", err)
	}
	return result.UserID,nil
}

func (m *DBoperations) GetAllUserNames() ([]map[string]interface{}, error) {
    // Define a slice to hold the results
    var users []map[string]interface{}

    // Get the MongoDB database
    db := m.GetDatabase()

    // Query all users from the 'users' collection
    cursor, err := db.Collection("users").Find(context.TODO(), bson.M{})
    if err != nil {
        return nil, fmt.Errorf("error fetching users: %w", err)
    }
    defer cursor.Close(context.TODO())

    // Iterate through the cursor and decode each document
    for cursor.Next(context.TODO()) {
        var user map[string]interface{}
        if err := cursor.Decode(&user); err != nil {
            return nil, fmt.Errorf("error decoding user: %w", err)
        }
        users = append(users, user)
    }

    if err := cursor.Err(); err != nil {
        return nil, fmt.Errorf("cursor error: %w", err)
    }

    return users, nil
}
func(m *DBoperations) InsertMessageIntoDB(message models.Message)error{
	db := m.GetDatabase()
	collection := db.Collection("messages")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := collection.InsertOne(ctx, message)
	if err != nil {
		return err
	}
	return nil

}
func (m *DBoperations) GetMessagesWhereCurrentUserIsSender(sender_id, receiver_id string) ([]map[string]interface{}, error) {
    var messages []map[string]interface{}

    // Get the MongoDB database
    db := m.GetDatabase()

    // Define the filter to fetch messages where senderid and receiverid match
    filter := bson.M{
        "$or": []bson.M{
            {"senderid": sender_id, "receiverid": receiver_id},
			{"senderid": receiver_id,"receiverid": sender_id},
            
        },
    }

    // Define the options to sort messages in chronological order based on the 'time' field
    findOptions := options.Find()
    findOptions.SetSort(bson.D{{Key: "time", Value: 1}}) // 1 for ascending order

    // Query the 'messages' collection
    cursor, err := db.Collection("messages").Find(context.TODO(), filter, findOptions)
    if err != nil {
        return nil, fmt.Errorf("error fetching messages: %w", err)
    }
    defer cursor.Close(context.TODO())

    // Iterate through the cursor and decode each document
    for cursor.Next(context.TODO()) {
        var message map[string]interface{}
        if err := cursor.Decode(&message); err != nil {
            return nil, fmt.Errorf("error decoding message: %w", err)
        }
        messages = append(messages, message)
    }

    // Check for cursor errors
    if err := cursor.Err(); err != nil {
        return nil, fmt.Errorf("cursor error: %w", err)
    }

    return messages, nil
}

func (m *DBoperations) UploadImageToDB(user_id string, fileBytes []byte) error {
	db := m.GetDatabase() // Get the database instance
	profilePics := db.Collection("profilepics")

	// Convert user_id to ObjectID if necessary (assuming user_id is a string, but you can change this to an ObjectID if needed)
	// If user_id is a string and you need ObjectID, you'd need conversion here.

	// Try to update the existing user's profile picture
	result, err := profilePics.UpdateOne(
		context.Background(),
		bson.M{"user_id": user_id}, // Find the user by user_id
		bson.M{
			"$set": bson.M{
				"picture":   fileBytes,   // Store the image data in 'picture' field
				"updated_at": time.Now(), // Add timestamp to the update
			},
		},
	)

	// If no record is updated (meaning the user_id didn't exist), insert a new record
	if err != nil {
		return fmt.Errorf("failed to update profile picture: %v", err)
	}

	if result.MatchedCount == 0 {
		// Create a new record if the user_id doesn't exist in the collection
		_, err := profilePics.InsertOne(
			context.Background(),
			bson.M{
				"user_id":  user_id,
				"picture":  fileBytes,
				"updated_at": time.Now(),
			},
		)

		if err != nil {
			return fmt.Errorf("failed to insert profile picture: %v", err)
		}
	}

	return nil
}
