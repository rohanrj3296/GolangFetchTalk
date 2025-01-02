package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// User represents a user in the chat application.
type User struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`  // Unique identifier for the user (MongoDB ObjectID)
	FirstName  string             `bson:"first_name"`     // First name of the user
	LastName   string             `bson:"last_name"`      // Last name of the user
	Email      string             `bson:"email"`          // Email of the user
	Password   string             `bson:"password"`       // Hashed password for security
	ProfilePic string             `bson:"profile_pic"`    // URL of the profile picture
	CreatedAt  time.Time          `bson:"created_at"`     // Timestamp of when the user was created
	UpdatedAt  time.Time          `bson:"updated_at"`     // Timestamp of the last update
}
type LoginForm struct{
	Email string
	Password string
}