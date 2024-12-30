package models

import (
	"time"
)

// User represents a user in the chat application.
type User struct {
	ID        int       `bson:"_id"`        // Unique identifier for the user
	Username  string    `bson:"username"`   // Username of the user
	Email     string    `bson:"email"`      // Email of the user
	Password  string    `bson:"password"`   // Hashed password for security
	CreatedAt time.Time `bson:"created_at"` // Timestamp of when the user was created
	UpdatedAt time.Time `bson:"updated_at"` // Timestamp of the last update
}

