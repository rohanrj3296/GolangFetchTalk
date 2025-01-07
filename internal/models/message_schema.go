package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
    SenderID    string             `json:"sender_id"`
    ReceiverID  string             `json:"receiver_id"`
    Time        string             `json:"time"`
    ActualMessage string           `json:"actual_message"`
    CreatedAt   primitive.DateTime `json:"created_at,omitempty"`
    UpdatedAt   primitive.DateTime `json:"updated_at,omitempty"`
}
