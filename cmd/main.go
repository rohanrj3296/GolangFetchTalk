package main

import (
	"context"
	"log"
	"time"

	"github.com/rohanrj3296/GolangChatWebApp/internal/models"
	"github.com/rohanrj3296/GolangChatWebApp/internal/repository" //imported as utils
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	// Connect to MongoDB
	utils.ConnectToMongo()

	// Get the "messages" collection
	db := utils.GetDatabase()
	collection := db.Collection("users")

	/*// Create a sample message
	message := models.Message{
		ID:         primitive.NewObjectID(),
		SenderID:   primitive.NewObjectID(),
		ReceiverID: primitive.NewObjectID(),
		Text:       "Hello, this is a test message2.",
		Image:      "",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Insert the message into the collection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, message)
	if err != nil {
		log.Fatalf("Failed to insert message: %v", err)
	}

	log.Println("Message inserted successfully!")*/

	eg_user:=models.User{
		ID:primitive.NewObjectID() ,
		FirstName: "Rohan",
		LastName: "Jadhav",
		Email: "rohanjadhavrj3296@gmail.com",
		Password: "ROHANjd@3296",

	}
	ctx,cancel:=context.WithTimeout(context.Background(),5*time.Second)
	defer cancel()
	_,err:=collection.InsertOne(ctx,eg_user)
	if err!=nil{
		log.Fatal("Failed To insert The user",err)
	}
	log.Println("User Inserted Successfully")
}
