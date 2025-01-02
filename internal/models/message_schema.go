package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`       // MongoDB ObjectID
	SenderID   primitive.ObjectID `bson:"sender_id"`           // Sender's ID
	ReceiverID primitive.ObjectID `bson:"receiver_id"`         // Receiver's ID
	Text       string             `bson:"text,omitempty"`      // Text content (optional)
	Image      string             `bson:"image,omitempty"`     // URL or path to the image (optional)
	CreatedAt  time.Time          `bson:"created_at"`          // Timestamp when the message was created
	UpdatedAt  time.Time          `bson:"updated_at"`          // Timestamp when the message was updated
}
