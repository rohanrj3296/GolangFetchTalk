package models

import "time"

type Message struct {
	ID        int       `bson:"_id"`        
	SentFrom  int       `bson:"sent_from"`  
	SentTo    int       `bson:"sent_to"`    
	Type      string    `bson:"type"`       
	Content   string    `bson:"content"`    
	CreatedAt time.Time `bson:"created_at"` 
	UpdatedAt time.Time `bson:"updated_at"` 
}