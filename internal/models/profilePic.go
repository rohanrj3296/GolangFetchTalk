package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Picture represents a user's profile picture in the chat application.
type Picture struct {
	UserID    primitive.ObjectID `bson:"user_id"`  // User ID (should be unique for each user)
	Picture   []byte             `bson:"picture"`  // The image stored as a byte slice (binary data)
	UpdatedAt time.Time          `bson:"updated_at"` // Timestamp of the last update
}