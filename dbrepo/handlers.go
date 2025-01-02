package dbrepo

import (
	"encoding/json"
	"net/http"

	"github.com/rohanrj3296/GolangChatWebApp/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type Repository struct{
	DB *DBoperations
}

// RegistrationHandler handles the user registration form submission
func (m *Repository) RegistrationHandler(w http.ResponseWriter, r *http.Request) {
	// Ensure the request method is POST
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}
	// Parse the incoming JSON payload
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	exists, err := m.DB.CheckEmailExists(user.Email)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Error(w, "Email already registered", http.StatusConflict)
		return
	}

	// Hash the user's password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}
	user.Password = string(hashedPassword) // Store the hashed password
	// Insert the user into the database
	err = m.DB.InsertUserIntoDB(user)
	if err != nil {
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}
	// Respond with success
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}
