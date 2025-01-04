package dbrepo

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	//"github.com/gorilla/mux"
	"github.com/dgrijalva/jwt-go"
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
func (m *Repository) LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Check if the method is POST
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Decode the login form data
	var loginForm models.User
	err := json.NewDecoder(r.Body).Decode(&loginForm)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Fetch the hashed password from the database
	hashedPassword, err := m.DB.GetHashedPasswordByEmail(loginForm.Email)
	if err != nil {
		http.Error(w, "User not found or database error", http.StatusInternalServerError)
		return
	}

	// Compare the provided password with the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(loginForm.Password))
	if err != nil {
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	}
	//generating jwt token
	token:=jwt.NewWithClaims(jwt.SigningMethodHS256,jwt.MapClaims{
		"email":loginForm.Email,
		"exp":time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString,err:=token.SignedString([]byte(os.Getenv("JWT_SECRET_KEY")))
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"token": tokenString})

	
	
}
func (m *Repository) AllUsersHandler(w http.ResponseWriter, r *http.Request) {
    // Check if the request method is GET
    if r.Method != http.MethodGet {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    // Fetch all users from the database
    users, err := m.DB.GetAllUserNames()
    if err != nil {
        http.Error(w, fmt.Sprintf("Error fetching users: %v", err), http.StatusInternalServerError)
        return
    }

    // Set response header to application/json
    w.Header().Set("Content-Type", "application/json")

    // Encode the users to JSON and write the response
    if err := json.NewEncoder(w).Encode(users); err != nil {
        http.Error(w, fmt.Sprintf("Error encoding response: %v", err), http.StatusInternalServerError)
        return
    }
}

